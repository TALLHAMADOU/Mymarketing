// Construit un projet HyperFrames par format (build/<format>/index.html) à partir de projet.json + timeline.json.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ErreurMM, FORMATS, NODE_MODULES, accent, esc, lireJSON, r3, run, sansMarques } from './util.mjs';
import { chargerCharte, chargerProjet } from './projet.mjs';
import { SCENES } from './scenes.mjs';
import { MISE_EN_PAGE, css } from './style.mjs';
import { logoHTML } from './icones.mjs';

const POLICES = {
  'inter-latin.woff2': '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  'inter-latin-ext.woff2': '@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2',
  'jbm-500.woff2': '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2',
  'jbm-700.woff2': '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2',
};

function tailleImage(f) {
  const r = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f]);
  const [w, h] = r.stdout.trim().split(',').map(Number);
  if (!w || !h) throw new ErreurMM(`Impossible de lire la taille de l'image ${f}`);
  return { w, h };
}

export function construire(dossier) {
  const { projet, charte } = chargerProjet(dossier);
  const ftl = path.join(dossier, 'timeline.json');
  if (!fs.existsSync(ftl)) throw new ErreurMM('timeline.json absent : lance d\'abord "mm voix".');
  const tl = lireJSON(ftl);
  if (tl.scenes.length !== projet.scenes.length) throw new ErreurMM('timeline.json ne correspond plus à projet.json : relance "mm voix".');
  const sorties = [];
  for (const fmt of projet.formats) sorties.push(construireFormat(dossier, projet, charte, tl, fmt));
  return sorties;
}

function construireFormat(dossier, projet, charte, tl, fmt) {
  const F = FORMATS[fmt];
  const M = MISE_EN_PAGE[fmt];
  const out = path.join(dossier, 'build', fmt);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
  fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
  fs.copyFileSync(path.join(NODE_MODULES, 'gsap', 'dist', 'gsap.min.js'), path.join(out, 'gsap.min.js'));
  for (const [dst, src] of Object.entries(POLICES)) fs.copyFileSync(path.join(NODE_MODULES, src), path.join(out, 'fonts', dst));

  const copiees = new Map();
  const copier = (ref) => {
    const src = path.isAbsolute(ref) ? ref : path.resolve(dossier, ref);
    if (!fs.existsSync(src)) return null;
    if (!copiees.has(src)) {
      const h = crypto.createHash('sha1').update(src).digest('hex').slice(0, 8);
      const nom = `${h}-${path.basename(src).replace(/[^\w.-]/g, '_')}`;
      fs.copyFileSync(src, path.join(out, 'assets', nom));
      copiees.set(src, `assets/${nom}`);
    }
    return copiees.get(src);
  };

  const zoneW = F.w - 2 * M.padx;
  const zoneH = F.h - M.haut - M.bas;
  const geomCache = new Map();
  const geomCapture = (sc) => {
    if (geomCache.has(sc)) return geomCache.get(sc);
    const src = path.resolve(dossier, sc.image);
    const { w: iw, h: ih } = tailleImage(src);
    const cadre = sc.cadre || 'navigateur';
    const reserve = (sc.titre ? 120 : 0) + (sc.legende ? 110 : 0) + (cadre === 'navigateur' ? 54 : 0) + (cadre === 'telephone' ? 32 : 0) + 20;
    const maxW = (cadre === 'telephone' ? 0.62 : 1) * zoneW - (cadre === 'telephone' ? 32 : 0);
    const maxH = zoneH - reserve;
    const k = Math.min(maxW / iw, maxH / ih);
    const w = Math.round(iw * k);
    const h = Math.round(ih * k);
    const g = { w, h, cw: w + (cadre === 'telephone' ? 32 : 0) };
    if (Array.isArray(sc.zoom) && sc.zoom.length === 4) {
      const [zx, zy, zw, zh] = [sc.zoom[0] * w, sc.zoom[1] * h, sc.zoom[2] * w, sc.zoom[3] * h];
      const s = Math.min(3.2, Math.min(w / zw, h / zh) * 0.9);
      const tx = Math.min(0, Math.max(w - w * s, w / 2 - (zx + zw / 2) * s));
      const ty = Math.min(0, Math.max(h - h * s, h / 2 - (zy + zh / 2) * s));
      g.zone = { x: Math.round(zx), y: Math.round(zy), w: Math.round(zw), h: Math.round(zh) };
      g.zoom = { x: r3(tx), y: r3(ty), s: r3(s) };
    }
    if (Array.isArray(sc.clic) && sc.clic.length === 2) {
      g.clic = { x: Math.round(sc.clic[0] * w), y: Math.round(sc.clic[1] * h) };
      g.clicVue = g.zoom ? { x: r3(g.clic.x * g.zoom.s + g.zoom.x), y: r3(g.clic.y * g.zoom.s + g.zoom.y) } : { ...g.clic };
    }
    geomCache.set(sc, g);
    return g;
  };

  const clips = [];
  const anims = [];
  const derniere = tl.scenes.length - 1;
  projet.scenes.forEach((sc, i) => {
    const t = tl.scenes[i];
    const def = SCENES[sc.type];
    if (!def) throw new ErreurMM(`Scène ${i + 1} : type inconnu "${sc.type}".`);
    const p = `s${i}`;
    const tf = t.temps_forts.length ? t.temps_forts : [t.debut + 0.35];
    // at(i, decalage, off) : temps d'apparition de l'élément i (le i-ème temps fort après "off"),
    // sinon réparti régulièrement entre le premier temps fort et 75 % de la scène.
    const at = (k, dec = 0, off = 0) => {
      const j = k + off;
      let base;
      if (j < tf.length) base = tf[j];
      else {
        // Plus d'éléments que de segments de voix : les suivants arrivent toutes les 0,8 s après le dernier temps fort.
        const dernier = tf[tf.length - 1] ?? t.debut + 0.4;
        base = dernier + 0.8 * (j - tf.length + 1);
      }
      return r3(Math.min(t.fin - 0.35, Math.max(t.debut + 0.05, base + dec)));
    };
    // off(aTitre, n) : 1 si un segment de voix d'introduction précède les n éléments (titre lu à voix haute).
    const off = (aTitre, n) => (aTitre && t.temps_forts.length > n ? 1 : 0);
    // "signature": "ok" dans projet.json = signer avec une autre charte (ex. signature Ok sur une pub client).
    const charteScene = sc.type === 'signature' && typeof projet.signature === 'string' ? chargerCharte(projet.signature, dossier) : charte;
    const ctx = { p, t0: t.debut, fin: t.fin, at, off, f: fmt, charte: charteScene, copier, geomCapture };
    if (def.media) {
      // Une scène avec une vidéo ne peut pas être un clip minuté (la vidéo porte son propre minutage) :
      // on la montre et la cache avec la timeline.
      clips.push(`<section class="scene" id="${p}" style="opacity:0"><div class="stage" id="${p}-stage">${def.html(sc, ctx)}</div></section>`);
      anims.push(`tl.set('#${p}', {opacity:1}, ${t.debut});\ntl.set('#${p}', {opacity:0}, ${t.fin});`);
    } else {
      clips.push(`<section class="clip scene" id="${p}" data-start="${t.debut}" data-duration="${r3(t.fin - t.debut)}" data-track-index="1"><div class="stage" id="${p}-stage">${def.html(sc, ctx)}</div></section>`);
    }
    anims.push(`// scène ${i + 1} : ${sc.type}\n${def.anim(sc, ctx)}`);
    if (i < derniere) anims.push(`sortie('#${p}-stage', ${r3(t.fin - 0.3)});`);
  });

  // Couche d'ambiance : deux halos très légers qui dérivent lentement (la vidéo "respire", sans distraire).
  const D = tl.duree;
  const habillage = [];
  if (projet.ambiance !== false) {
    habillage.push(`<div class="clip" id="amb-clip" data-start="0" data-duration="${D}" data-track-index="0"><div class="amb" id="amb1"></div><div class="amb" id="amb2"></div></div>`);
    anims.push(`tl.fromTo('#amb1', {xPercent:-20, yPercent:-10}, {xPercent:25, yPercent:20, duration:${D}, ease:'sine.inOut'}, 0);`);
    anims.push(`tl.fromTo('#amb2', {xPercent:15, yPercent:10}, {xPercent:-25, yPercent:-15, duration:${D}, ease:'sine.inOut'}, 0);`);
  }
  // Légère poussée de caméra pendant chaque scène.
  projet.scenes.forEach((sc, i) => {
    if (SCENES[sc.type]?.media) return;
    const t = tl.scenes[i];
    anims.push(`tl.fromTo('#s${i}', {scale:1}, {scale:1.025, duration:${r3(t.fin - t.debut)}, ease:'none'}, ${t.debut});`);
  });

  // Barre de progression (rétention sur les réseaux) et marque discrète.
  const avantSignature = projet.scenes[derniere]?.type === 'signature' ? tl.scenes[derniere].debut : D;
  if (projet.progression !== false) {
    habillage.push(`<div class="clip" id="prog-clip" data-start="0" data-duration="${D}" data-track-index="0"><div class="prog" id="prog"></div></div>`);
    anims.push(`tl.fromTo('#prog', {scaleX:0}, {scaleX:1, duration:${D}, ease:'none'}, 0);`);
  }
  if (charte.marque?.active && avantSignature > 1) {
    const contenu = charte.logo ? logoHTML(charte.logo, { taille: 52, copier, couleur: 'encre' }) : `<b>${esc(charte.marque.texte || charte.nom)}</b>`;
    habillage.push(`<div class="clip" id="marque-clip" data-start="0.3" data-duration="${r3(avantSignature - 0.3)}" data-track-index="0"><div class="marque" id="marque">${contenu}${charte.marque.libelle ? `<span>${esc(charte.marque.libelle)}</span>` : ''}</div></div>`);
    anims.push(`inn('#marque', 0.35, {y:-10, d:0.5});`);
  }

  // Sous-titres : morceaux de 2 à 5 mots, répartis selon la longueur dans chaque segment de voix.
  const st = [];
  if (projet.sous_titres !== false) {
    let k = 0;
    for (const s of tl.scenes) {
      for (const seg of s.segments) {
        const morceaux = decouper(seg.texte);
        const total = morceaux.reduce((a, b) => a + sansMarques(b).length + 1, 0);
        let t = seg.debut;
        const dSeg = seg.fin - seg.debut;
        morceaux.forEach((m) => {
          const d = (dSeg * (sansMarques(m).length + 1)) / total;
          st.push({ k, m, debut: r3(t), fin: r3(t + d) });
          t += d;
          k++;
        });
      }
    }
    if (st.length) {
      habillage.push(`<div class="clip" id="st-clip" data-start="0" data-duration="${D}" data-track-index="2"><div class="sous-titres">${st
        .map((x) => `<div class="st" id="st${x.k}">${accent(x.m)}</div>`)
        .join('')}</div></div>`);
      for (const x of st) anims.push(`stIn('#st${x.k}', ${x.debut}, ${x.fin});`);
    }
  }

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${F.w}, height=${F.h}">
<title>${esc(projet.titre || 'Mymarketing')} (${fmt})</title>
<script src="gsap.min.js"></script>
<style>${css(charte, fmt)}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="${F.w}" data-height="${F.h}" data-duration="${D}" data-fps="30">
${habillage.join('\n')}
${clips.join('\n')}
</div>
<script>
const tl = gsap.timeline({ paused: true });
const existe = (s) => document.querySelector(s) !== null;
function inn(sel, t, o = {}) {
  if (!existe(sel)) return;
  tl.fromTo(sel, { opacity: 0, y: o.y ?? 36, x: o.x ?? 0, scale: o.s ?? 1 },
    { opacity: 1, y: 0, x: 0, scale: 1, duration: o.d ?? 0.6, ease: o.e ?? 'power3.out', stagger: o.st ?? 0 }, t);
}
function sortie(sel, t) {
  if (!existe(sel)) return;
  tl.fromTo(sel, { opacity: 1, y: 0 }, { opacity: 0, y: -28, duration: 0.3, ease: 'power2.in', immediateRender: false }, t);
}
function stIn(sel, a, b) {
  tl.fromTo(sel, { opacity: 0, y: 12, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.14, ease: 'power2.out' }, a);
  tl.fromTo(sel, { opacity: 1 }, { opacity: 0, duration: 0.06, immediateRender: false }, Math.max(a + 0.15, b - 0.06));
}
${anims.join('\n')}
window.__timelines["main"] = tl;
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(out, 'index.html'), html);
  return { fmt, dossier: out, duree: D, sousTitres: st.length };
}

function decouper(texte) {
  const mots = String(texte).split(/\s+/).filter(Boolean);
  const res = [];
  let cur = [];
  for (const m of mots) {
    cur.push(m);
    const len = cur.join(' ').replace(/\*/g, '').length;
    const finPhrase = /[.!?:;,]$/.test(m.replace(/\*/g, ''));
    if (cur.length >= 5 || len >= 26 || (finPhrase && cur.length >= 2)) {
      res.push(cur.join(' '));
      cur = [];
    }
  }
  if (cur.length) {
    if (cur.length === 1 && res.length && res[res.length - 1].split(' ').length < 5) res[res.length - 1] += ' ' + cur[0];
    else res.push(cur.join(' '));
  }
  // Une étoile d'accent ne doit pas être coupée entre deux morceaux.
  return res.map((r) => ((r.match(/\*/g) || []).length % 2 ? r.replace(/\*/g, '') : r));
}
