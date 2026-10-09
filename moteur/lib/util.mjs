// Utilitaires partagés du moteur Mymarketing.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const MOTEUR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const RACINE = path.resolve(MOTEUR, '..');
export const NODE_MODULES = path.join(MOTEUR, 'node_modules');
export const HF_BIN = path.join(NODE_MODULES, '.bin', 'hyperframes');
// Python de Mymarketing : l'environnement virtuel créé par installer.sh (voix Kokoro + numpy), sinon python3.
const VENV_PY = path.join(MOTEUR, '.venv', 'bin', 'python');
export const PYTHON = process.env.MYMARKETING_PYTHON || (fs.existsSync(VENV_PY) ? VENV_PY : 'python3');

export const FORMATS = {
  '4x5': { w: 1080, h: 1350, nom: 'LinkedIn (4:5)' },
  '9x16': { w: 1080, h: 1920, nom: 'TikTok / WhatsApp (9:16)' },
  '1x1': { w: 1080, h: 1080, nom: 'Carré (1:1)' },
  '16x9': { w: 1920, h: 1080, nom: 'Horizontal (16:9)' },
};

export class ErreurMM extends Error {}

export function lireJSON(fichier) {
  try {
    return JSON.parse(fs.readFileSync(fichier, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') throw new ErreurMM(`Fichier introuvable : ${fichier}`);
    throw new ErreurMM(`JSON invalide dans ${fichier} : ${e.message}`);
  }
}

export function ecrireJSON(fichier, data) {
  fs.mkdirSync(path.dirname(fichier), { recursive: true });
  fs.writeFileSync(fichier, JSON.stringify(data, null, 2) + '\n');
}

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
  if (r.error) throw new ErreurMM(`Impossible de lancer ${cmd} : ${r.error.message}`);
  if (r.status !== 0 && !opts.tolerer) {
    const sortie = (r.stderr || '') + (r.stdout || '');
    throw new ErreurMM(`${cmd} ${args.slice(0, 3).join(' ')} … a échoué (code ${r.status})\n${sortie.slice(-3000)}`);
  }
  return r;
}

export function hf(args, opts = {}) {
  const env = { ...process.env, HYPERFRAMES_TELEMETRY: '0', DO_NOT_TRACK: '1', NO_COLOR: '1', ...(opts.env || {}) };
  if (!env.HYPERFRAMES_PYTHON && PYTHON !== 'python3') env.HYPERFRAMES_PYTHON = PYTHON;
  return run(HF_BIN, args, { ...opts, env });
}

export function dureeAudio(fichier) {
  const r = run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', fichier]);
  return parseFloat(r.stdout.trim());
}

export function slug(s) {
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'video';
}

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Texte d'écran : *mot* = mot mis en avant (couleur d'accent).
export function accent(s) {
  return esc(String(s ?? '').replace(/\s+([?!:;»])/g, '\u00A0$1')).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function sansMarques(s) {
  return String(s ?? '').replace(/\*/g, '').replace(/\s*\|\s*/g, ' ').trim();
}

export function r3(x) {
  return Math.round(x * 1000) / 1000;
}

export function log(...a) {
  console.log(...a);
}

export function dossierProjet(arg) {
  const d = path.resolve(arg || '.');
  if (!fs.existsSync(path.join(d, 'projet.json'))) {
    throw new ErreurMM(`Pas de projet.json dans ${d}. Crée le projet avec : mm nouveau <type> <nom>`);
  }
  return d;
}

export function etat(dossier, maj) {
  const f = path.join(dossier, 'etat.json');
  const e = fs.existsSync(f) ? lireJSON(f) : { etapes: {} };
  if (maj) {
    e.etapes[maj] = new Date().toISOString();
    ecrireJSON(f, e);
  }
  return e;
}
