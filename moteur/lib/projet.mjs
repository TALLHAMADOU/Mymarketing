// Chargement, création et validation d'un projet vidéo (projet.json).
import fs from 'node:fs';
import path from 'node:path';
import { ErreurMM, FORMATS, RACINE, ecrireJSON, lireJSON, sansMarques, slug } from './util.mjs';
import { SCENES } from './scenes.mjs';
import { iconeExiste } from './icones.mjs';

export const CHARTE_DEFAUT = {
  nom: '',
  couleurs: {
    fond: '#FFFFFF', surface: '#F4F2EE', encre: '#0B0B0B', encre_douce: '#5E5E5E',
    accent: '#FF5A1F', accent_texte: null, sur_accent: '#FFFFFF', ligne: '#E5E2DC',
    positif: '#16A34A', negatif: '#DC2626', code_fond: '#111318',
  },
  logo: null,
  signature: { active: false },
  marque: { active: false },
  prononciation: {},
};

export function chargerCharte(ref, dossier) {
  let c;
  if (!ref) c = {};
  else if (typeof ref === 'object') c = ref;
  else {
    const candidats = [path.resolve(dossier, ref), path.join(RACINE, 'chartes', `${ref}.json`)];
    const f = candidats.find((x) => fs.existsSync(x) && fs.statSync(x).isFile());
    if (!f) throw new ErreurMM(`Charte introuvable : "${ref}" (cherchée dans le projet et dans chartes/).`);
    c = lireJSON(f);
    if (c.logo && !c.logo.startsWith('si:') && !path.isAbsolute(c.logo)) c.logo = path.resolve(path.dirname(f), c.logo);
  }
  return {
    ...CHARTE_DEFAUT, ...c,
    couleurs: { ...CHARTE_DEFAUT.couleurs, ...(c.couleurs || {}) },
    signature: { ...CHARTE_DEFAUT.signature, ...(c.signature || {}) },
    marque: { ...CHARTE_DEFAUT.marque, ...(c.marque || {}) },
  };
}

export function chargerProjet(dossier) {
  const projet = lireJSON(path.join(dossier, 'projet.json'));
  if (!Array.isArray(projet.scenes) || !projet.scenes.length) throw new ErreurMM('projet.json : "scenes" doit contenir au moins une scène.');
  const charte = chargerCharte(projet.charte, dossier);
  const scenes = projet.scenes.filter((s) => s.type !== 'signature');
  const signer = projet.signature ?? charte.signature.active;
  const derniere = projet.scenes.find((s) => s.type === 'signature');
  if (signer) scenes.push(derniere || { type: 'signature' });
  projet.scenes = scenes;
  projet.formats = projet.formats || ['4x5', '9x16'];
  return { projet, charte };
}

const GABARITS = {
  'tech-post': {
    type: 'tech-post', charte: 'ok', signature: true, duree_cible: 60, formats: ['4x5', '9x16'],
    voix: { mode: 'synth', voix: 'ff_siwis', vitesse: 1.05 },
    musique: { mode: 'auto', humeur: 'tech' },
  },
  promo: {
    type: 'promo', charte: 'charte.json', signature: true, duree_cible: 60, formats: ['4x5', '9x16'],
    voix: { mode: 'synth', voix: 'ff_siwis', vitesse: 1.05 },
    musique: { mode: 'auto', humeur: 'positive' },
  },
  client: {
    type: 'client', charte: 'charte.json', signature: false, duree_cible: 30, formats: ['4x5', '9x16'],
    voix: { mode: 'synth', voix: 'ff_siwis', vitesse: 1.05 },
    musique: { mode: 'auto', humeur: 'positive' },
  },
};

export function nouveauProjet(type, nom, { dans = 'videos' } = {}) {
  if (!GABARITS[type]) throw new ErreurMM(`Type inconnu "${type}". Types : ${Object.keys(GABARITS).join(', ')}`);
  const dossier = path.resolve(dans, slug(nom));
  if (fs.existsSync(path.join(dossier, 'projet.json'))) throw new ErreurMM(`Le projet existe déjà : ${dossier}`);
  fs.mkdirSync(path.join(dossier, 'sources'), { recursive: true });
  ecrireJSON(path.join(dossier, 'projet.json'), { titre: nom, ...GABARITS[type], scenes: [] });
  // Les fichiers de travail se régénèrent : on ne versionne que le script, la charte, les sources et les sorties.
  fs.writeFileSync(path.join(dossier, '.gitignore'), 'build/\naudio/\nrevue/images-*/\netat.json\n');
  if (type !== 'tech-post') {
    ecrireJSON(path.join(dossier, 'charte.json'), {
      nom,
      couleurs: { accent: '#FF5A1F' },
      logo: null,
      signature: { active: false },
      marque: { active: false },
    });
  }
  return dossier;
}

export function validerProjet(dossier) {
  const erreurs = [];
  const avert = [];
  let projet, charte;
  try {
    ({ projet, charte } = chargerProjet(dossier));
  } catch (e) {
    return { erreurs: [e.message], avert, estimation: 0 };
  }
  for (const f of projet.formats) if (!FORMATS[f]) erreurs.push(`Format inconnu "${f}" (formats : ${Object.keys(FORMATS).join(', ')})`);
  const voixMode = projet.voix?.mode || 'synth';
  let mots = 0;
  let fixe = 0;
  projet.scenes.forEach((sc, i) => {
    const ou = `scène ${i + 1} (${sc.type})`;
    const def = SCENES[sc.type];
    if (!def) {
      erreurs.push(`${ou} : type inconnu. Types : ${Object.keys(SCENES).join(', ')}`);
      return;
    }
    for (const r of def.requis) if (sc[r] === undefined || sc[r] === null || sc[r] === '') erreurs.push(`${ou} : champ "${r}" manquant.`);
    const segs = sc.voix ? (Array.isArray(sc.voix) ? sc.voix : String(sc.voix).split('|')).filter((s) => s.trim()) : [];
    mots += segs.join(' ').split(/\s+/).filter(Boolean).length;
    if (!segs.length) fixe += sc.duree ?? 2.7;
    if (voixMode !== 'aucune' && !segs.length && !['signature', 'accroche', 'titre'].includes(sc.type)) avert.push(`${ou} : pas de voix (la scène durera ${sc.duree ?? 2.8}s).`);
    const nItems = { liste: sc.items?.length, etapes: sc.etapes?.length, tableau: sc.lignes?.length, pour_contre: (sc.pour?.length || 0) + (sc.contre?.length || 0) }[sc.type];
    if (nItems && segs.length && segs.length < Math.min(nItems, 3)) avert.push(`${ou} : ${nItems} éléments mais ${segs.length} segment(s) de voix. Sépare la voix avec "|" pour faire apparaître chaque élément sur sa phrase.`);
    if (nItems > 6) avert.push(`${ou} : ${nItems} éléments, c'est beaucoup pour un téléphone (6 max conseillé).`);
    for (const img of [sc.image, sc.video, sc.gauche?.logo, sc.droite?.logo, ...(sc.logos || [])].filter(Boolean)) {
      if (typeof img !== 'string') continue;
      if (img.startsWith('si:')) { if (!iconeExiste(img)) avert.push(`${ou} : logo "${img}" absent de Simple Icons (un monogramme sera affiché).`); }
      else if (/\.(png|jpe?g|webp|svg|mp4|mov|webm)$/i.test(img) && !fs.existsSync(path.resolve(dossier, img))) erreurs.push(`${ou} : fichier introuvable "${img}".`);
    }
    const longs = JSON.stringify(sc).match(/"(titre|texte|critere)":"([^"]{90,})"/g);
    if (longs) avert.push(`${ou} : texte d'écran très long, il sera petit. Raccourcis (l'écran montre, la voix explique).`);
    if (sc.type === 'capture' && Array.isArray(sc.zoom) && Array.isArray(sc.clic)) {
      const [zx, zy, zw, zh] = sc.zoom;
      const [cx, cy] = sc.clic;
      if (cx < zx || cx > zx + zw || cy < zy || cy > zy + zh) avert.push(`${ou} : le clic [${sc.clic}] est hors de la zone zoomée : le curseur sera hors champ. Mets le clic dans la zone.`);
    }
    if (sc.type === 'chiffre' && !sc.source) avert.push(`${ou} : chiffre sans "source". Rappel : aucun chiffre inventé.`);
  });
  const estimation = Math.round(mots / 2.5 + fixe + projet.scenes.length * 0.8);
  const cible = projet.duree_cible;
  if (cible && voixMode !== 'moi' && (estimation > cible * 1.2 || estimation < cible * 0.6)) avert.push(`Durée estimée ~${estimation}s pour une cible de ${cible}s. Ajuste le texte de la voix.`);
  return { erreurs, avert, estimation, scenes: projet.scenes.length, charte: charte.nom };
}

export function texteVoixComplet(projet) {
  return projet.scenes.map((s) => sansMarques(Array.isArray(s.voix) ? s.voix.join(' ') : s.voix || '')).filter(Boolean).join('\n');
}
