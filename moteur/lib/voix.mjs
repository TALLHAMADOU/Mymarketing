// Voix off + calcul de la ligne de temps (timeline.json).
// La voix est générée segment par segment ("|" dans le texte) : chaque segment devient un "temps fort"
// sur lequel les éléments de la scène apparaissent. Les durées sont mesurées, jamais devinées.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ErreurMM, dureeAudio, ecrireJSON, hf, lireJSON, log, r3, run, sansMarques } from './util.mjs';
import { chargerProjet } from './projet.mjs';

const LECTURE_CPS = 14; // caractères par seconde quand il n'y a pas de voix (lecture des sous-titres)

export function segmentsDe(scene) {
  const v = scene.voix;
  if (!v) return [];
  const arr = Array.isArray(v) ? v : String(v).split('|');
  return arr.map((s) => s.trim()).filter(Boolean);
}

export function prononcer(texte, dico = {}) {
  let t = sansMarques(texte);
  for (const [mot, dit] of Object.entries(dico)) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'gu');
    t = t.replace(re, dit);
  }
  return t;
}

function tts(texte, { voix, vitesse }, dossierCache) {
  const h = crypto.createHash('sha1').update(`${voix}|${vitesse}|${texte}`).digest('hex').slice(0, 16);
  const f = path.join(dossierCache, `${h}.wav`);
  if (!fs.existsSync(f)) {
    fs.mkdirSync(dossierCache, { recursive: true });
    const lang = voix.startsWith('f') ? 'fr-fr' : undefined;
    const args = ['tts', texte, '--voice', voix, '--speed', String(vitesse), '-o', f, '--json'];
    if (lang) args.push('--lang', lang);
    hf(args);
  }
  return f;
}

export function calculerVoix(dossier, { forcer = false } = {}) {
  const { projet, charte } = chargerProjet(dossier);
  const v = { mode: 'synth', voix: 'ff_siwis', vitesse: 1.05, ...(projet.voix || {}) };
  const dico = { ...(charte.prononciation || {}), ...(projet.prononciation || {}) };
  const scenes = projet.scenes;
  const cache = path.join(dossier, 'audio', 'cache');
  if (forcer) fs.rmSync(cache, { recursive: true, force: true });

  if (v.mode === 'moi') return voixEnregistree(dossier, projet, v);

  const GAP = 0.16;
  let curseur = 0;
  const out = [];
  const pistes = [];
  scenes.forEach((sc, i) => {
    const segs = segmentsDe(sc);
    const lead = sc.attaque ?? 0.3;
    const debut = curseur;
    let t = debut + lead;
    const segments = [];
    for (const s of segs) {
      let d;
      let fichier = null;
      if (v.mode === 'synth') {
        fichier = tts(prononcer(s, dico), v, cache);
        d = dureeAudio(fichier);
        pistes.push({ fichier, t });
      } else {
        d = Math.max(1.0, sansMarques(s).length / LECTURE_CPS);
      }
      segments.push({ texte: s, debut: r3(t), fin: r3(t + d), fichier: fichier && path.relative(dossier, fichier) });
      t += d + GAP;
    }
    let fin = segs.length ? t - GAP + (sc.queue ?? 0.55) : debut + (sc.duree ?? (sc.type === 'signature' ? 2.6 : 2.8));
    if (sc.duree && fin < debut + sc.duree) fin = debut + sc.duree;
    fin = Math.max(fin, debut + 1.6);
    out.push({ index: i, type: sc.type, debut: r3(debut), fin: r3(fin), temps_forts: segments.map((s) => s.debut), segments });
    curseur = fin;
  });

  const tl = { duree: r3(curseur), mode_voix: v.mode, scenes: out };
  ecrireJSON(path.join(dossier, 'timeline.json'), tl);
  if (v.mode === 'synth') assemblerVoix(dossier, pistes, tl.duree);
  else fs.rmSync(path.join(dossier, 'audio', 'voix.wav'), { force: true });
  return tl;
}

function assemblerVoix(dossier, pistes, duree) {
  const sortie = path.join(dossier, 'audio', 'voix.wav');
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  // Mixe chaque segment à sa place (adelay) sur un fond de silence de la durée totale.
  const args = ['-y', '-loglevel', 'error', '-f', 'lavfi', '-t', String(duree + 0.5), '-i', 'anullsrc=r=48000:cl=mono'];
  pistes.forEach((p) => args.push('-i', p.fichier));
  const f = pistes.map((p, k) => `[${k + 1}:a]aresample=48000,aformat=channel_layouts=mono,adelay=${Math.round(p.t * 1000)}:all=1[a${k}]`);
  f.push(`[0:a]${pistes.map((_, k) => `[a${k}]`).join('')}amix=inputs=${pistes.length + 1}:normalize=0:duration=first[v]`);
  args.push('-filter_complex', f.join(';'), '-map', '[v]', '-ar', '48000', sortie);
  run('ffmpeg', args);
}

// --- Voix enregistrée par l'utilisateur ---------------------------------------
// On transcrit l'enregistrement, puis on répartit les segments du script sur les mots reconnus.
function voixEnregistree(dossier, projet, v) {
  if (!v.fichier) throw new ErreurMM('voix.mode = "moi" demande voix.fichier (ton enregistrement, ex. "sources/ma-voix.m4a").');
  const src = path.resolve(dossier, v.fichier);
  if (!fs.existsSync(src)) throw new ErreurMM(`Enregistrement introuvable : ${src}`);
  const wav = path.join(dossier, 'audio', 'voix.wav');
  fs.mkdirSync(path.dirname(wav), { recursive: true });
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-ac', '1', '-ar', '48000', '-af', 'highpass=f=80,afftdn=nf=-25', wav]);
  const transcription = path.join(dossier, 'audio', 'transcription.json');
  if (!fs.existsSync(transcription)) {
    const r = hf(['transcribe', wav, '--json', '-l', 'fr', '-m', v.modele || 'small', '-d', path.join(dossier, 'audio')]);
    fs.writeFileSync(transcription, r.stdout);
  }
  const mots = extraireMots(lireJSON(transcription));
  if (!mots.length) throw new ErreurMM('La transcription ne contient aucun mot horodaté. Vérifie l\'enregistrement.');

  const scenes = projet.scenes;
  const tous = scenes.flatMap((sc, i) => segmentsDe(sc).map((s) => ({ i, s, n: sansMarques(s).split(/\s+/).filter(Boolean).length })));
  const totalScript = tous.reduce((a, b) => a + b.n, 0) || 1;
  const ratio = mots.length / totalScript;
  let k = 0;
  for (const seg of tous) {
    const n = Math.max(1, Math.round(seg.n * ratio));
    const a = mots[Math.min(k, mots.length - 1)];
    const b = mots[Math.min(k + n - 1, mots.length - 1)];
    seg.debut = a.start;
    seg.fin = b.end;
    k += n;
  }
  const duree = dureeAudio(wav) + 0.6;
  const out = [];
  let curseur = 0;
  scenes.forEach((sc, i) => {
    const segs = tous.filter((x) => x.i === i);
    const suivant = tous.find((x) => x.i > i);
    const debut = curseur;
    let fin;
    if (segs.length) fin = suivant ? Math.max(segs[segs.length - 1].fin + 0.1, suivant.debut - 0.35) : segs[segs.length - 1].fin + (sc.queue ?? 0.6);
    else fin = debut + (sc.duree ?? 2.6);
    fin = Math.max(fin, debut + 1.6);
    out.push({
      index: i, type: sc.type, debut: r3(debut), fin: r3(fin),
      temps_forts: segs.map((s) => r3(s.debut)),
      segments: segs.map((s) => ({ texte: s.s, debut: r3(s.debut), fin: r3(s.fin), fichier: null })),
    });
    curseur = fin;
  });
  const tl = { duree: r3(Math.max(curseur, duree)), mode_voix: 'moi', scenes: out };
  ecrireJSON(path.join(dossier, 'timeline.json'), tl);
  log('Alignement voix enregistrée : approximatif (réparti selon le nombre de mots). Vérifie le storyboard.');
  return tl;
}

function extraireMots(j) {
  const res = [];
  const visiter = (x) => {
    if (Array.isArray(x)) return x.forEach(visiter);
    if (x && typeof x === 'object') {
      const txt = x.word ?? x.text;
      if (typeof txt === 'string' && typeof x.start === 'number' && typeof x.end === 'number' && !/\s/.test(txt.trim())) {
        res.push({ w: txt.trim(), start: x.start, end: x.end });
        return;
      }
      Object.values(x).forEach(visiter);
    }
  };
  visiter(j);
  return res.sort((a, b) => a.start - b.start);
}
