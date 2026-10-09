// Logos : "si:graphql" (Simple Icons, CC0), un chemin d'image du projet, ou un texte (monogramme).
import fs from 'node:fs';
import path from 'node:path';
import { NODE_MODULES, esc } from './util.mjs';

const SI_DIR = path.join(NODE_MODULES, 'simple-icons', 'icons');
let siData = null;

function siCouleur(slugIcone) {
  if (!siData) {
    try {
      siData = JSON.parse(fs.readFileSync(path.join(NODE_MODULES, 'simple-icons', 'data', 'simple-icons.json'), 'utf8'));
      if (!Array.isArray(siData)) siData = siData.icons || [];
    } catch {
      siData = [];
    }
  }
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const ent = siData.find((d) => (d.slug && d.slug === slugIcone) || norm(d.title) === norm(slugIcone));
  return ent ? '#' + ent.hex : null;
}

export function iconeExiste(ref) {
  if (!ref || typeof ref !== 'string') return false;
  if (ref.startsWith('si:')) return fs.existsSync(path.join(SI_DIR, ref.slice(3) + '.svg'));
  return true;
}

// Retourne du HTML pour un logo dans une boîte carrée de `taille` px (avant échelle --u).
// opts.couleur : 'marque' (couleur officielle), 'encre' ou une couleur CSS.
export function logoHTML(ref, { taille = 120, couleur = 'marque', copier, nom = '' } = {}) {
  const box = `width:calc(${taille}px*var(--u));height:calc(${taille}px*var(--u))`;
  if (ref && typeof ref === 'string' && ref.startsWith('si:')) {
    const s = ref.slice(3);
    const f = path.join(SI_DIR, s + '.svg');
    if (fs.existsSync(f)) {
      let svg = fs.readFileSync(f, 'utf8');
      const c = couleur === 'marque' ? siCouleur(s) || 'var(--encre)' : couleur === 'encre' ? 'var(--encre)' : couleur;
      svg = svg.replace('<svg ', `<svg fill="${c}" style="${box};display:block" `);
      return `<div class="logo" style="${box}">${svg}</div>`;
    }
  }
  if (ref && typeof ref === 'string' && /\.(png|jpe?g|webp|svg)$/i.test(ref) && copier) {
    const rel = copier(ref);
    if (rel) return `<div class="logo" style="${box}"><img src="${esc(rel)}" alt="" style="width:100%;height:100%;object-fit:contain"></div>`;
  }
  const txt = String((ref && !ref.startsWith?.('si:') ? ref : nom) || '?').replace(/^si:/, '');
  const mono = txt.length <= 4 ? txt.toUpperCase() : txt.slice(0, 2).toUpperCase();
  const fs2 = mono.length <= 2 ? 0.42 : mono.length === 3 ? 0.32 : 0.26;
  return `<div class="logo mono" style="${box};font-size:calc(${Math.round(taille * fs2)}px*var(--u))">${esc(mono)}</div>`;
}
