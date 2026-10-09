// Bande son : musique (bibliothèque, fichier fourni ou fond généré) + effets + voix,
// avec la musique qui baisse quand la voix parle, puis normalisation à -14 LUFS (réseaux sociaux).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ErreurMM, MOTEUR, PYTHON, RACINE, dureeAudio, ecrireJSON, log, run } from './util.mjs';

const EXT_AUDIO = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;
export const DOSSIER_MUSIQUE = process.env.MYMARKETING_MUSIQUE || path.join(RACINE, 'bibliotheque', 'musique');

export function listerMusiques(humeur) {
  const dossiers = humeur ? [path.join(DOSSIER_MUSIQUE, humeur)] : [];
  dossiers.push(DOSSIER_MUSIQUE);
  for (const d of dossiers) {
    if (!fs.existsSync(d)) continue;
    const f = fs.readdirSync(d).filter((x) => EXT_AUDIO.test(x)).sort().map((x) => path.join(d, x));
    if (f.length) return f;
  }
  return [];
}

// Choisit la musique et renvoie { fichier, origine }.
export function choisirMusique(dossier, projet, duree) {
  const m = { mode: 'auto', humeur: 'tech', ...(projet.musique || {}) };
  if (m.mode === 'aucune') return { fichier: null, origine: 'aucune' };
  if (m.fichier) {
    const f = path.resolve(dossier, m.fichier);
    if (!fs.existsSync(f)) throw new ErreurMM(`Musique introuvable : ${f}`);
    return { fichier: f, origine: `fichier du projet (${m.fichier})` };
  }
  if (m.mode !== 'generee') {
    const local = fs.existsSync(path.join(dossier, 'sources'))
      ? fs.readdirSync(path.join(dossier, 'sources')).find((x) => /^musique\./i.test(x) && EXT_AUDIO.test(x))
      : null;
    if (local) return { fichier: path.join(dossier, 'sources', local), origine: `sources/${local}` };
    const biblio = listerMusiques(m.humeur).filter((f) => !(m.exclure || []).includes(path.basename(f)));
    if (biblio.length) {
      const h = parseInt(crypto.createHash('sha1').update(projet.titre || dossier).digest('hex').slice(0, 8), 16);
      const f = biblio[h % biblio.length];
      return { fichier: f, origine: `bibliothèque (${path.relative(DOSSIER_MUSIQUE, f)})` };
    }
  }
  const f = path.join(dossier, 'audio', 'fond-genere.wav');
  genererSons(dossier, { duree, humeur: m.humeur, bpm: m.bpm, fond: f });
  return { fichier: f, origine: 'fond généré (bibliothèque vide)' };
}

function genererSons(dossier, plan) {
  const f = path.join(dossier, 'audio', `plan-sons-${crypto.randomBytes(3).toString('hex')}.json`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  ecrireJSON(f, plan);
  try {
    run(PYTHON, [path.join(MOTEUR, 'audio', 'sons.py'), f]);
  } finally {
    fs.rmSync(f, { force: true });
  }
}

// Effets : un souffle à chaque changement de scène, un "pop" léger quand un élément arrive.
function genererEffets(dossier, tl, projet) {
  if (projet.effets === false) return null;
  const transitions = tl.scenes.slice(1).map((s) => s.debut);
  const apparitions = tl.scenes.flatMap((s) => s.temps_forts.slice(1)).filter((t) => t > 0.5);
  const f = path.join(dossier, 'audio', 'sfx.wav');
  genererSons(dossier, { duree: tl.duree, transitions, apparitions, sfx: f });
  return f;
}

function mesurerLoudnorm(fichier, cible) {
  const r = run('ffmpeg', ['-hide_banner', '-nostats', '-i', fichier, '-af', `loudnorm=I=${cible}:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-'], { tolerer: true });
  const m = (r.stderr || '').match(/\{[\s\S]*?"input_i"[\s\S]*?\}/);
  if (!m) throw new ErreurMM('Mesure de volume (loudnorm) impossible.');
  return JSON.parse(m[0]);
}

// Produit audio/mix.wav (stéréo 48 kHz, -14 LUFS). Renvoie un résumé.
export function mixerAudio(dossier, tl, projet) {
  const D = tl.duree;
  const voix = path.join(dossier, 'audio', 'voix.wav');
  const aVoix = fs.existsSync(voix) && tl.mode_voix !== 'aucune';
  const { fichier: musique, origine } = choisirMusique(dossier, projet, D);
  const sfx = genererEffets(dossier, tl, projet);
  const cible = projet.audio?.lufs ?? -14;
  const volMusique = projet.musique?.volume ?? (aVoix ? 0.32 : 0.75);

  const args = ['-y', '-hide_banner', '-loglevel', 'error'];
  const entrees = [];
  const filtres = [];
  const aMixer = [];
  if (aVoix) {
    args.push('-i', voix);
    entrees.push('voix');
    filtres.push(`[${entrees.length - 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur=${D},atrim=0:${D},asplit=2[v][vsc]`);
    aMixer.push('[v]');
  }
  if (musique) {
    args.push('-stream_loop', '-1', '-i', musique);
    entrees.push('musique');
    const k = entrees.length - 1;
    const fo = Math.min(2.5, D / 4);
    filtres.push(`[${k}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${D},asetpts=N/SR/TB,afade=t=in:d=0.8,afade=t=out:st=${(D - fo).toFixed(2)}:d=${fo.toFixed(2)},volume=${volMusique}[m0]`);
    if (aVoix) {
      filtres.push('[m0][vsc]sidechaincompress=threshold=0.03:ratio=6:attack=30:release=450:makeup=1[m]');
    } else filtres.push('[m0]anull[m]');
    aMixer.push('[m]');
  } else if (aVoix) filtres.push('[vsc]anullsink');
  if (sfx) {
    args.push('-i', sfx);
    entrees.push('sfx');
    filtres.push(`[${entrees.length - 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${D},volume=${projet.audio?.volume_effets ?? 0.55}[s]`);
    aMixer.push('[s]');
  }
  if (!aMixer.length) return { audio: null, origine_musique: origine };
  filtres.push(`${aMixer.join('')}amix=inputs=${aMixer.length}:normalize=0:duration=longest,atrim=0:${D}[mix]`);
  const brut = path.join(dossier, 'audio', 'mix-brut.wav');
  run('ffmpeg', [...args, '-filter_complex', filtres.join(';'), '-map', '[mix]', '-ar', '48000', '-ac', '2', brut]);

  const m = mesurerLoudnorm(brut, cible);
  const sortie = path.join(dossier, 'audio', 'mix.wav');
  const ln = `loudnorm=I=${cible}:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', brut, '-af', `${ln},aresample=48000`, '-ar', '48000', sortie]);
  const fin = mesurerLoudnorm(sortie, cible);
  log(`Audio : ${parseFloat(fin.input_i).toFixed(1)} LUFS, crête ${parseFloat(fin.input_tp).toFixed(1)} dBTP. Musique : ${origine}.`);
  return { audio: sortie, lufs: parseFloat(fin.input_i), crete: parseFloat(fin.input_tp), origine_musique: origine, duree: dureeAudio(sortie) };
}
