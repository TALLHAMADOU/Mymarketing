// Vérification, storyboard (images fixes à valider) et rendu final MP4 par format.
import fs from 'node:fs';
import path from 'node:path';
import { ErreurMM, dureeAudio, ecrireJSON, etat, hf, lireJSON, log, r3, run, slug } from './util.mjs';
import { chargerProjet } from './projet.mjs';
import { mixerAudio } from './audio.mjs';

function timeline(dossier) {
  const f = path.join(dossier, 'timeline.json');
  if (!fs.existsSync(f)) throw new ErreurMM('timeline.json absent : lance "mm voix" puis "mm construire".');
  return lireJSON(f);
}

function dossierBuild(dossier, fmt) {
  const d = path.join(dossier, 'build', fmt);
  if (!fs.existsSync(path.join(d, 'index.html'))) throw new ErreurMM(`build/${fmt} absent : lance "mm construire".`);
  return d;
}

// hyperframes check : lint + mise en page + contraste. Renvoie les problèmes trouvés par format.
export function verifier(dossier) {
  const { projet } = chargerProjet(dossier);
  const res = {};
  for (const fmt of projet.formats) {
    const r = hf(['check', dossierBuild(dossier, fmt), '--json', '--samples', '12'], { tolerer: true });
    let j;
    try {
      j = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
    } catch {
      j = { brut: (r.stdout + r.stderr).slice(-2000) };
    }
    res[fmt] = { ok: r.status === 0, ...resumerCheck(j) };
  }
  return res;
}

function resumerCheck(j) {
  const problemes = [];
  const visiter = (x, ou) => {
    if (Array.isArray(x)) return x.forEach((y) => visiter(y, ou));
    if (!x || typeof x !== 'object') return;
    if ((x.severity || x.level) && (x.message || x.code || x.rule)) {
      problemes.push({ gravite: x.severity || x.level, code: x.code || x.rule || '', message: String(x.message || '').slice(0, 300), ou: x.selector || x.file || ou || '', temps: x.time ?? x.t ?? null });
      return;
    }
    for (const [k, v] of Object.entries(x)) visiter(v, k);
  };
  visiter(j);
  // Avertissements qui concernent l'édition dans HyperFrames Studio, pas l'image rendue.
  const ignores = new Set(['nested_structure_needs_subcomposition', 'timeline_track_too_dense']);
  for (let i = problemes.length - 1; i >= 0; i--) if (ignores.has(problemes[i].code) || String(problemes[i].ou).startsWith('#amb') || /^#st\d+$/.test(String(problemes[i].ou))) problemes.splice(i, 1);
  const erreurs = problemes.filter((p) => /error|erreur/i.test(p.gravite));
  return { erreurs: erreurs.length, avertissements: problemes.length - erreurs.length, problemes: problemes.slice(0, 40), brut: j.brut };
}

// Un instant "posé" par scène : quand tous ses éléments sont arrivés.
export function instantsStoryboard(tl) {
  // Juste avant la sortie de la scène : tous ses éléments sont arrivés.
  return tl.scenes.map((s) => r3(Math.max(s.debut + 0.2, s.fin - 0.45)));
}

export function storyboard(dossier, { formats } = {}) {
  const { projet } = chargerProjet(dossier);
  const tl = timeline(dossier);
  const instants = instantsStoryboard(tl);
  const sorties = [];
  fs.mkdirSync(path.join(dossier, 'revue'), { recursive: true });
  for (const fmt of formats || projet.formats) {
    const snap = path.join(dossier, 'revue', `images-${fmt}`);
    fs.rmSync(snap, { recursive: true, force: true });
    hf(['snapshot', dossierBuild(dossier, fmt), '--at', instants.join(','), '--no-end', '-o', snap, '--describe', 'false']);
    const pngs = fs.readdirSync(snap).filter((f) => f.endsWith('.png')).sort(trierParTemps);
    if (!pngs.length) throw new ErreurMM(`Aucune image produite pour ${fmt}.`);
    // Planche contact : 4 images par ligne, numérotées dans l'ordre des scènes.
    const liste = path.join(snap, 'liste.txt');
    const imgs = [];
    pngs.forEach((p, i) => {
      const dst = path.join(snap, `scene-${String(i + 1).padStart(2, '0')}.png`);
      fs.renameSync(path.join(snap, p), dst);
      imgs.push(dst);
    });
    fs.writeFileSync(liste, imgs.map((f) => `file '${f}'`).join('\n'));
    const cols = Math.min(4, imgs.length);
    const rows = Math.ceil(imgs.length / cols);
    const planche = path.join(dossier, 'revue', `storyboard-${fmt}.png`);
    run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', liste, '-vf', `scale=360:-1,pad=iw+12:ih+12:6:6:white,tile=${cols}x${rows}:color=white`, '-frames:v', '1', planche]);
    fs.rmSync(liste, { force: true });
    sorties.push({ fmt, planche, images: imgs });
  }
  ecrireJSON(path.join(dossier, 'revue', 'storyboard.json'), {
    scenes: tl.scenes.map((s, i) => ({ scene: i + 1, type: s.type, instant: instants[i], voix: s.segments.map((x) => x.texte).join(' ') })),
    planches: sorties.map((s) => path.relative(dossier, s.planche)),
  });
  etat(dossier, 'storyboard');
  return sorties;
}

function trierParTemps(a, b) {
  const n = (s) => parseFloat((s.match(/(\d+(?:\.\d+)?)/g) || ['0']).pop());
  return n(a) - n(b) || a.localeCompare(b);
}

export function rendre(dossier, { qualite = 'delivery', formats } = {}) {
  const { projet } = chargerProjet(dossier);
  const tl = timeline(dossier);
  const audio = mixerAudio(dossier, tl, projet);
  const nom = slug(projet.titre || path.basename(dossier));
  const sortieDir = path.join(dossier, 'sorties');
  fs.mkdirSync(sortieDir, { recursive: true });
  const res = [];
  for (const fmt of formats || projet.formats) {
    const b = dossierBuild(dossier, fmt);
    const muet = path.join(b, 'video-muette.mp4');
    const t0 = Date.now();
    const r = hf(['render', b, '-o', muet, '--quality', qualite, '--fps', '30', '--quiet']);
    if (!fs.existsSync(muet) || fs.statSync(muet).size === 0) throw new ErreurMM(`Le rendu ${fmt} n'a pas produit de fichier.\n${(r.stdout + r.stderr).slice(-1500)}`);
    const final = path.join(sortieDir, `${nom}-${fmt}.mp4`);
    if (audio.audio) {
      run('ffmpeg', ['-y', '-loglevel', 'error', '-i', muet, '-i', audio.audio, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
    } else fs.copyFileSync(muet, final);
    fs.rmSync(muet, { force: true });
    const d = dureeAudio(final);
    const ecart = Math.abs(d - tl.duree);
    log(`Rendu ${fmt} : ${path.relative(dossier, final)} (${d.toFixed(1)} s, ${((Date.now() - t0) / 1000).toFixed(0)} s de calcul)`);
    res.push({ fmt, fichier: final, duree: r3(d), ecart_duree: r3(ecart), taille_mo: r3(fs.statSync(final).size / 1e6) });
  }
  ecrireJSON(path.join(sortieDir, 'rendu.json'), { date: new Date().toISOString(), qualite, audio: { lufs: audio.lufs, crete: audio.crete, musique: audio.origine_musique }, videos: res.map((x) => ({ ...x, fichier: path.basename(x.fichier) })) });
  etat(dossier, 'rendu');
  return { videos: res, audio };
}
