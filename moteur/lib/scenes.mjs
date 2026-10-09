// Bibliothèque de scènes : chaque type produit son HTML (statique) et son animation GSAP (temps absolus).
// Le contenu vient de projet.json ; l'agent écrit des données, pas du code.
import { accent, esc } from './util.mjs';
import { logoHTML } from './icones.mjs';

// --- outils de mise en page -------------------------------------------------

// Taille de police (px avant échelle) qui rétrécit avec la longueur du texte.
export function taille(texte, base, min, ref) {
  const n = String(texte || '').replace(/\*/g, '').length;
  if (n <= ref) return base;
  return Math.max(min, Math.round(base * Math.sqrt(ref / n)));
}
const px = (n) => `calc(${n}px*var(--u))`;
// Découpe en mots animables. "*deux mots*" garde l'accent sur chaque mot ;
// la ponctuation haute (? ! : ;) reste collée au mot précédent par une espace insécable.
const mots = (texte) =>
  String(texte || '')
    .replace(/\*([^*]+)\*/g, (_, g) => g.trim().split(/\s+/).map((w) => `*${w}*`).join(' '))
    .replace(/\s+([?!:;»])/g, '\u00A0$1')
    .replace(/([«])\s+/g, '$1\u00A0')
    .split(/[ \t\n\r]+/)
    .filter(Boolean)
    .map((m) => `<span class="mot">${accent(m)}</span>`)
    .join(' ');
const item = (x) => (typeof x === 'string' ? { titre: x } : x || {});
const VRAI = new Set(['✓', 'oui', 'yes', 'true', '✔', 'v']);
const FAUX = new Set(['✗', 'non', 'no', 'false', '✘', 'x']);
function cellule(v) {
  if (v === true || VRAI.has(String(v).toLowerCase())) return `<span class="ico ok">${ICO.check}</span>`;
  if (v === false || FAUX.has(String(v).toLowerCase())) return `<span class="ico ko">${ICO.croix}</span>`;
  return accent(v ?? '');
}

export const ICO = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  croix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  fleche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  curseur: '<svg viewBox="0 0 40 56"><path d="M3 3 L3 41 L12.5 32 L19 47 L25.5 44.2 L19.2 29.8 L32 29.8 Z" fill="#0B0B0B" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/></svg>',
  guillemet: '<svg viewBox="0 0 48 40" fill="currentColor"><path d="M0 40V22C0 9 7 2 19 0l2 6c-7 2-10 6-10 13h9v21H0zm27 0V22C27 9 34 2 46 0l2 6c-7 2-10 6-10 13h9v21H27z"/></svg>',
};

// --- définitions des scènes -------------------------------------------------
// Chaque scène : { requis, aide, html(sc, c), anim(sc, c) }
// c = contexte : p (préfixe d'id), t0, fin, at(i, decalage) temps d'apparition de l'élément i, f (format), copier(img)

export const SCENES = {
  accroche: {
    aide: 'Phrase choc d\'ouverture. lignes:[...] (une ligne par segment de voix) ou texte. *mot* = accent.',
    requis: [],
    html(sc) {
      const lignes = sc.lignes || [sc.texte || sc.titre || ''];
      const plusLongue = lignes.reduce((a, b) => (String(b).length > String(a).length ? b : a), '');
      const fs = taille(plusLongue, 110, 62, 16);
      return `<div class="accroche" style="font-size:${px(fs)}">${lignes
        .map((l) => `<div class="ligne">${mots(l)}</div>`)
        .join('')}</div>${sc.sous_texte ? `<p class="sous">${accent(sc.sous_texte)}</p>` : ''}`;
    },
    anim(sc, c) {
      const lignes = sc.lignes || [sc.texte || sc.titre || ''];
      return lignes
        .map((_, i) => `inn('#${c.p} .ligne:nth-child(${i + 1}) .mot', ${c.at(i)}, {y:50, st:0.06, d:0.55});`)
        .join('\n') + (sc.sous_texte ? `\ninn('#${c.p} .sous', ${c.at(lignes.length)}, {y:20});` : '');
    },
  },

  titre: {
    aide: 'Titre du sujet. surtitre?, titre, sous_titre?, logos?:["si:graphql", "REST"]',
    requis: ['titre'],
    html(sc, c) {
      const logos = (sc.logos || []).map((l) => logoHTML(l, { taille: 150, copier: c.copier })).join('');
      return `${logos ? `<div class="logos">${logos}</div>` : ''}${sc.surtitre ? `<div class="surtitre">${accent(sc.surtitre)}</div>` : ''}
<h1 class="grand" style="font-size:${px(taille(sc.titre, 112, 64, 14))}">${mots(sc.titre)}</h1>${sc.sous_titre ? `<p class="sous">${accent(sc.sous_titre)}</p>` : ''}`;
    },
    anim(sc, c) {
      return [
        sc.logos?.length ? `inn('#${c.p} .logo', ${c.t0 + 0.05}, {s:0.6, y:0, st:0.12, e:'back.out(1.6)'});` : '',
        sc.surtitre ? `inn('#${c.p} .surtitre', ${c.t0 + 0.15}, {y:20});` : '',
        `inn('#${c.p} .grand .mot', ${c.t0 + 0.25}, {y:60, st:0.07});`,
        sc.sous_titre ? `inn('#${c.p} .sous', ${c.at(1, 0.7)}, {y:20});` : '',
      ].join('\n');
    },
  },

  versus: {
    aide: 'Duel A vs B. gauche:{nom, logo?, sous_titre?}, droite:{...}, titre?',
    requis: ['gauche', 'droite'],
    html(sc, c) {
      const carte = (x, cote) => `<div class="vs-carte ${cote}">${logoHTML(x.logo || x.nom, { taille: 170, copier: c.copier, nom: x.nom })}
<div class="vs-nom" style="font-size:${px(taille(x.nom, 70, 44, 9))}">${accent(x.nom)}</div>${x.sous_titre ? `<div class="vs-sous">${accent(x.sous_titre)}</div>` : ''}</div>`;
      return `${sc.titre ? `<div class="surtitre">${accent(sc.titre)}</div>` : ''}<div class="vs">${carte(sc.gauche, 'g')}<div class="vs-badge">VS</div>${carte(sc.droite, 'd')}</div>`;
    },
    anim(sc, c) {
      return [
        sc.titre ? `inn('#${c.p} .surtitre', ${c.t0 + 0.1}, {y:20});` : '',
        `inn('#${c.p} .vs-carte.g', ${c.at(0)}, {x:-90, y:0, d:0.65});`,
        `inn('#${c.p} .vs-badge', ${c.at(0, 0.35)}, {s:0.3, y:0, e:'back.out(2)'});`,
        `inn('#${c.p} .vs-carte.d', ${c.at(1, 0.6)}, {x:90, y:0, d:0.65});`,
      ].join('\n');
    },
  },

  tableau: {
    aide: 'Comparatif. colonnes:["REST","GraphQL"] (ou {nom,logo}), lignes:[{critere, a, b, gagnant:"a"|"b"}], titre?. Valeurs ✓/✗ acceptées.',
    requis: ['colonnes', 'lignes'],
    html(sc, c) {
      const cols = sc.colonnes.map(item);
      const n = sc.lignes.length;
      const fs = n > 5 ? 32 : 36;
      const tete = `<div class="tb-ligne tb-tete"><div></div>${cols
        .map((x) => `<div class="tb-col">${x.logo ? logoHTML(x.logo, { taille: 56, copier: c.copier, nom: x.titre || x.nom }) : ''}<span>${accent(x.titre || x.nom)}</span></div>`)
        .join('')}</div>`;
      const lignes = sc.lignes
        .map((l, i) => {
          const g = l.gagnant;
          return `<div class="tb-ligne tb-l${i}"><div class="tb-crit">${accent(l.critere)}</div><div class="tb-val ${g === 'a' ? 'gagne' : ''}">${cellule(l.a)}</div><div class="tb-val ${g === 'b' ? 'gagne' : ''}">${cellule(l.b)}</div></div>`;
        })
        .join('');
      return `${sc.titre ? `<div class="surtitre">${accent(sc.titre)}</div>` : ''}<div class="tableau" style="font-size:${px(fs)}">${tete}${lignes}</div>`;
    },
    anim(sc, c) {
      return [
        sc.titre ? `inn('#${c.p} .surtitre', ${c.t0 + 0.1}, {y:20});` : '',
        `inn('#${c.p} .tb-tete', ${c.t0 + 0.2}, {y:24});`,
        ...sc.lignes.map((_, i, a) => `inn('#${c.p} .tb-l${i}', ${c.at(i, 0, c.off(true, a.length))}, {y:28, d:0.5});\ninn('#${c.p} .tb-l${i} .gagne', ${c.at(i, 0.35, c.off(true, a.length))}, {s:0.85, y:0, d:0.4, e:'back.out(2)'});`),
      ].join('\n');
    },
  },

  pour_contre: {
    aide: 'Avantages / inconvénients. titre?, pour:[...], contre:[...], libelle_pour?, libelle_contre?',
    requis: ['pour', 'contre'],
    html(sc) {
      const col = (cls, lib, items, ico) => `<div class="pc-col ${cls}"><div class="pc-lib">${esc(lib)}</div>${items
        .map((x, i) => `<div class="pc-item pc-${cls}${i}"><span class="ico ${cls === 'pour' ? 'ok' : 'ko'}">${ico}</span><span>${accent(item(x).titre)}</span></div>`)
        .join('')}</div>`;
      const total = sc.pour.length + sc.contre.length;
      return `${sc.titre ? `<h2 class="moyen">${accent(sc.titre)}</h2>` : ''}<div class="pc" style="font-size:${px(total > 6 ? 32 : 36)}">${col('pour', sc.libelle_pour || 'Avantages', sc.pour, ICO.check)}${col('contre', sc.libelle_contre || 'Inconvénients', sc.contre, ICO.croix)}</div>`;
    },
    anim(sc, c) {
      const ordre = [...sc.pour.map((_, i) => `.pc-pour${i}`), ...sc.contre.map((_, i) => `.pc-contre${i}`)];
      return [
        sc.titre ? `inn('#${c.p} .moyen', ${c.t0 + 0.1}, {y:24});` : '',
        `inn('#${c.p} .pc-col.pour .pc-lib', ${c.t0 + 0.2}, {y:20});`,
        `inn('#${c.p} .pc-col.contre .pc-lib', ${c.at(sc.pour.length, -0.2, 0)}, {y:20});`,
        ...ordre.map((s, i) => `inn('#${c.p} ${s}', ${c.at(i)}, {x:-30, y:0, d:0.5});`),
      ].join('\n');
    },
  },

  liste: {
    aide: 'Liste / top N. titre, items:["..." ou {titre, detail}], numerotee?:true',
    requis: ['items'],
    html(sc) {
      const n = sc.items.length;
      const fs = n > 5 ? 34 : 40;
      return `${sc.titre ? `<h2 class="moyen">${accent(sc.titre)}</h2>` : ''}<div class="liste" style="font-size:${px(fs)}">${sc.items
        .map((x, i) => {
          const it = item(x);
          return `<div class="li li${i}"><div class="li-num">${sc.numerotee === false ? ICO.check : i + 1}</div><div class="li-txt"><div class="li-t">${accent(it.titre)}</div>${it.detail ? `<div class="li-d">${accent(it.detail)}</div>` : ''}</div></div>`;
        })
        .join('')}</div>`;
    },
    anim(sc, c) {
      return [
        sc.titre ? `inn('#${c.p} .moyen', ${c.t0 + 0.1}, {y:24});` : '',
        ...sc.items.map((_, i, a) => `inn('#${c.p} .li${i}', ${c.at(i, 0, c.off(sc.titre, a.length))}, {x:-40, y:0, d:0.5});\ninn('#${c.p} .li${i} .li-num', ${c.at(i, 0.05, c.off(sc.titre, a.length))}, {s:0.4, y:0, d:0.45, e:'back.out(2.2)'});`),
      ].join('\n');
    },
  },

  etapes: {
    aide: 'Processus en étapes reliées. titre?, etapes:["..." ou {titre, detail}]',
    requis: ['etapes'],
    html(sc) {
      return `${sc.titre ? `<h2 class="moyen">${accent(sc.titre)}</h2>` : ''}<div class="etapes" style="font-size:${px(sc.etapes.length > 4 ? 34 : 40)}"><div class="et-rail"></div>${sc.etapes
        .map((x, i) => {
          const it = item(x);
          return `<div class="et et${i}"><div class="et-pt">${i + 1}</div><div class="li-txt"><div class="li-t">${accent(it.titre)}</div>${it.detail ? `<div class="li-d">${accent(it.detail)}</div>` : ''}</div></div>`;
        })
        .join('')}</div>`;
    },
    anim(sc, c) {
      const n = sc.etapes.length;
      const off = c.off(sc.titre, n);
      return [
        sc.titre ? `inn('#${c.p} .moyen', ${c.t0 + 0.1}, {y:24});` : '',
        `tl.fromTo('#${c.p} .et-rail', {scaleY:0}, {scaleY:1, duration:${Math.max(0.6, c.at(n - 1, 0.3, off) - c.at(0, 0, off))}, ease:'none', transformOrigin:'50% 0%'}, ${c.at(0, 0, off)});`,
        ...sc.etapes.map((_, i) => `inn('#${c.p} .et${i}', ${c.at(i, 0, off)}, {x:-30, y:0, d:0.5});`),
      ].join('\n');
    },
  },

  code: {
    aide: 'Extrait de code. titre?, blocs:[{libelle?, langage?, code:"..."}] (1 ou 2 blocs) ou code + langage. legende?',
    requis: [],
    html(sc) {
      const blocs = sc.blocs || [{ libelle: sc.libelle, langage: sc.langage, code: sc.code || '' }];
      const maxL = Math.max(...blocs.map((b) => String(b.code).split('\n').length));
      const maxC = Math.max(...blocs.map((b) => Math.max(...String(b.code).split('\n').map((l) => l.length))));
      const fs = Math.max(22, Math.min(34, Math.floor(880 / (maxC * 0.62)), blocs.length > 1 ? 30 : 34, maxL > 10 ? 28 : 34));
      return `${sc.titre ? `<h2 class="moyen">${accent(sc.titre)}</h2>` : ''}<div class="codes">${blocs
        .map((b, i) => `<div class="code code${i}"><div class="code-barre"><i></i><i></i><i></i><span>${esc(b.libelle || b.langage || '')}</span></div><pre style="font-size:${px(fs)}">${String(b.code)
          .split('\n')
          .map((l, j) => `<div class="cl cl${j}">${colorer(l) || ' '}</div>`)
          .join('')}</pre></div>`)
        .join('')}</div>${sc.legende ? `<p class="sous">${accent(sc.legende)}</p>` : ''}`;
    },
    anim(sc, c) {
      const blocs = sc.blocs || [{ code: sc.code || '' }];
      const off = c.off(sc.titre, blocs.length + (sc.legende ? 1 : 0));
      const out = [sc.titre ? `inn('#${c.p} .moyen', ${c.t0 + 0.1}, {y:24});` : ''];
      blocs.forEach((b, i) => {
        const t = c.at(i, 0, off);
        const lignes = String(b.code).split('\n');
        out.push(`inn('#${c.p} .code${i}', ${t}, {y:30, d:0.5});`);
        const dl = Math.min(0.22, 1.2 / lignes.length);
        lignes.forEach((l, j) => {
          out.push(`tl.fromTo('#${c.p} .code${i} .cl${j}', {clipPath:'inset(0 100% 0 0)'}, {clipPath:'inset(0 0% 0 0)', duration:${Math.max(0.1, Math.min(0.35, l.length * 0.014))}, ease:'none'}, ${t + 0.25 + j * dl});`);
        });
      });
      if (sc.legende) out.push(`inn('#${c.p} .sous', ${c.at(blocs.length, 0, off)}, {y:20});`);
      return out.join('\n');
    },
  },

  chiffre: {
    aide: 'Un chiffre RÉEL (jamais inventé). valeur:"250 000", unite?, legende, source?',
    requis: ['valeur', 'legende'],
    html(sc) {
      return `<div class="chiffre"><div class="ch-masque"><div class="ch-val" style="font-size:${px(taille(sc.valeur, 220, 120, 7))}">${esc(sc.valeur)}</div></div>${sc.unite ? `<div class="ch-unite">${accent(sc.unite)}</div>` : ''}<div class="ch-barre"></div><p class="ch-leg">${accent(sc.legende)}</p>${sc.source ? `<div class="ch-src">Source : ${esc(sc.source)}</div>` : ''}</div>`;
    },
    anim(sc, c) {
      return [
        `tl.fromTo('#${c.p} .ch-val', {yPercent:105}, {yPercent:0, duration:0.75, ease:'power4.out'}, ${c.t0 + 0.15});`,
        sc.unite ? `inn('#${c.p} .ch-unite', ${c.t0 + 0.5}, {y:20});` : '',
        `tl.fromTo('#${c.p} .ch-barre', {scaleX:0}, {scaleX:1, duration:0.7, ease:'power3.inOut', transformOrigin:'0% 50%'}, ${c.t0 + 0.6});`,
        `inn('#${c.p} .ch-leg', ${c.at(1, 0.8)}, {y:20});`,
        sc.source ? `inn('#${c.p} .ch-src', ${c.at(1, 1.0)}, {y:10});` : '',
      ].join('\n');
    },
  },

  capture: {
    aide: 'Vraie capture d\'écran animée. image:"sources/x.png", cadre:"navigateur"|"telephone"|"aucun", titre?, legende?, zoom?:[x,y,l,h] (fractions 0-1 de l\'image), clic?:[x,y] (fractions)',
    requis: ['image'],
    html(sc, c) {
      const g = c.geomCapture(sc);
      const src = c.copier(sc.image);
      const barre = sc.cadre === 'navigateur' ? `<div class="nav-barre"><i></i><i></i><i></i><span>${esc(sc.url || '')}</span></div>` : '';
      return `${sc.titre ? `<h2 class="moyen">${accent(sc.titre)}</h2>` : ''}<div class="cap cadre-${sc.cadre || 'navigateur'}" style="width:${g.cw}px">${barre}<div class="cap-vue" style="width:${g.w}px;height:${g.h}px"><div class="cap-img" style="width:${g.w}px;height:${g.h}px"><img src="${esc(src)}" alt="" style="width:${g.w}px;height:${g.h}px">${g.zone ? `<div class="cap-zone" style="left:${g.zone.x}px;top:${g.zone.y}px;width:${g.zone.w}px;height:${g.zone.h}px"></div>` : ''}</div>${g.clic ? `<div class="cap-onde" style="left:${g.clic.x}px;top:${g.clic.y}px"></div><div class="cap-curseur">${ICO.curseur}</div>` : ''}</div></div>${sc.legende ? `<p class="sous">${accent(sc.legende)}</p>` : ''}`;
    },
    anim(sc, c) {
      const g = c.geomCapture(sc);
      const off = c.off(sc.titre, (g.clic ? 2 : 1) + (sc.legende ? 1 : 0));
      const out = [
        sc.titre ? `inn('#${c.p} .moyen', ${c.t0 + 0.1}, {y:24});` : '',
        `inn('#${c.p} .cap', ${c.t0 + 0.15}, {y:60, s:0.96, d:0.7});`,
      ];
      let t = c.at(0, 0.5, off);
      if (g.zone) {
        out.push(`tl.fromTo('#${c.p} .cap-zone', {opacity:0, scale:1.15}, {opacity:1, scale:1, duration:0.45, ease:'power3.out'}, ${t});`);
        out.push(`tl.fromTo('#${c.p} .cap-img', {x:0, y:0, scale:1}, {x:${g.zoom.x}, y:${g.zoom.y}, scale:${g.zoom.s}, duration:1.1, ease:'power3.inOut', transformOrigin:'0% 0%'}, ${t + 0.5});`);
        t += 1.7;
      }
      if (g.clic) {
        const tc = Math.max(t, c.at(1, 0.2, off));
        out.push(`tl.fromTo('#${c.p} .cap-curseur', {x:${g.w + 40}, y:${g.h + 40}, opacity:0}, {x:${g.clicVue.x}, y:${g.clicVue.y}, opacity:1, duration:0.8, ease:'power3.inOut'}, ${tc});`);
        out.push(`tl.fromTo('#${c.p} .cap-curseur svg', {scale:1}, {scale:0.82, duration:0.1, yoyo:true, repeat:1, transformOrigin:'0% 0%'}, ${tc + 0.85});`);
        out.push(`tl.fromTo('#${c.p} .cap-onde', {opacity:0.9, scale:0.2, x:${g.clicVue.x - g.clic.x}, y:${g.clicVue.y - g.clic.y}}, {opacity:0, scale:2.4, duration:0.6, ease:'power2.out'}, ${tc + 0.88});`);
      }
      if (sc.legende) out.push(`inn('#${c.p} .sous', ${c.at(1, 0.4, off)}, {y:20});`);
      return out.join('\n');
    },
  },

  video: {
    aide: 'Vraie vidéo de l\'app (écran filmé). video:"sources/demo.mp4", cadre:"telephone"|"navigateur"|"aucun", titre?, legende?, debut_source?:secondes',
    requis: ['video'],
    media: true,
    html(sc, c) {
      const g = c.geomCapture({ ...sc, image: sc.video, zoom: null, clic: null });
      const src = c.copier(sc.video);
      const cadre = sc.cadre || 'telephone';
      const barre = cadre === 'navigateur' ? `<div class="nav-barre"><i></i><i></i><i></i><span>${esc(sc.url || '')}</span></div>` : '';
      return `${sc.titre ? `<h2 class="moyen">${accent(sc.titre)}</h2>` : ''}<div class="cap cadre-${cadre}" style="width:${g.cw}px">${barre}<div class="cap-vue" style="width:${g.w}px;height:${g.h}px"><video id="${c.p}-video" class="clip" src="${esc(src)}" muted playsinline data-start="${c.t0}" data-duration="${(c.fin - c.t0).toFixed(3)}" data-track-index="3"${sc.debut_source ? ` data-media-start="${sc.debut_source}"` : ''} style="width:${g.w}px;height:${g.h}px;object-fit:cover;display:block"></video></div></div>${sc.legende ? `<p class="sous">${accent(sc.legende)}</p>` : ''}`;
    },
    anim(sc, c) {
      return [
        sc.titre ? `inn('#${c.p} .moyen', ${c.t0 + 0.1}, {y:24});` : '',
        `inn('#${c.p} .cap', ${c.t0 + 0.1}, {y:60, s:0.96, d:0.7});`,
        sc.legende ? `inn('#${c.p} .sous', ${c.at(1, 0.3, c.off(sc.titre, 2))}, {y:20});` : '',
      ].join('\n');
    },
  },

  avant_apres: {
    aide: 'Avant / après. avant:{titre?, items:[...]}, apres:{titre?, items:[...]}',
    requis: ['avant', 'apres'],
    html(sc) {
      const bloc = (cls, b, def, ico) => `<div class="aa ${cls}"><div class="aa-t">${accent(b.titre || def)}</div>${(b.items || [])
        .map((x, i) => `<div class="aa-i aa-${cls}${i}"><span class="ico ${cls === 'apres' ? 'ok' : 'ko'}">${ico}</span><span>${accent(item(x).titre)}</span></div>`)
        .join('')}</div>`;
      const n = (sc.avant.items || []).length + (sc.apres.items || []).length;
      return `<div class="aas" style="font-size:${px(n > 6 ? 32 : 36)}">${bloc('avant', sc.avant, 'Avant', ICO.croix)}<div class="aa-fleche">${ICO.fleche}</div>${bloc('apres', sc.apres, 'Après', ICO.check)}</div>`;
    },
    anim(sc, c) {
      const na = (sc.avant.items || []).length;
      const out = [`inn('#${c.p} .aa.avant', ${c.t0 + 0.1}, {y:30});`];
      (sc.avant.items || []).forEach((_, i) => out.push(`inn('#${c.p} .aa-avant${i}', ${c.at(i)}, {x:-30, y:0, d:0.45});`));
      out.push(`inn('#${c.p} .aa-fleche', ${c.at(na, -0.3)}, {s:0.4, y:0, e:'back.out(2)'});`);
      out.push(`inn('#${c.p} .aa.apres', ${c.at(na, -0.1)}, {y:30});`);
      (sc.apres.items || []).forEach((_, i) => out.push(`inn('#${c.p} .aa-apres${i}', ${c.at(na + i, 0.2)}, {x:-30, y:0, d:0.45});`));
      return out.join('\n');
    },
  },

  citation: {
    aide: 'Témoignage RÉEL avec accord. texte, auteur, role?',
    requis: ['texte', 'auteur'],
    html(sc) {
      return `<div class="cit"><div class="cit-g">${ICO.guillemet}</div><blockquote style="font-size:${px(taille(sc.texte, 60, 38, 60))}">${mots(sc.texte)}</blockquote><div class="cit-a"><b>${esc(sc.auteur)}</b>${sc.role ? `<span>${esc(sc.role)}</span>` : ''}</div></div>`;
    },
    anim(sc, c) {
      return [
        `inn('#${c.p} .cit-g', ${c.t0 + 0.1}, {s:0.5, y:0, e:'back.out(2)'});`,
        `inn('#${c.p} blockquote .mot', ${c.t0 + 0.3}, {y:24, st:0.035, d:0.45});`,
        `inn('#${c.p} .cit-a', ${c.at(1, 0.8)}, {y:20});`,
      ].join('\n');
    },
  },

  texte: {
    aide: 'Texte simple. titre?, texte',
    requis: ['texte'],
    html(sc) {
      return `${sc.titre ? `<h2 class="moyen">${accent(sc.titre)}</h2>` : ''}<p class="para" style="font-size:${px(taille(sc.texte, 54, 36, 80))}">${mots(sc.texte)}</p>`;
    },
    anim(sc, c) {
      return [sc.titre ? `inn('#${c.p} .moyen', ${c.t0 + 0.1}, {y:24});` : '', `inn('#${c.p} .para .mot', ${c.t0 + 0.3}, {y:20, st:0.03, d:0.4});`].join('\n');
    },
  },

  appel: {
    aide: 'Appel à l\'action. titre, action (texte du bouton), sous_titre?, contact?',
    requis: ['titre', 'action'],
    html(sc) {
      return `<h1 class="grand" style="font-size:${px(taille(sc.titre, 96, 56, 18))}">${mots(sc.titre)}</h1>${sc.sous_titre ? `<p class="sous">${accent(sc.sous_titre)}</p>` : ''}<div class="bouton">${esc(sc.action)}</div>${sc.contact ? `<div class="contact">${esc(sc.contact)}</div>` : ''}`;
    },
    anim(sc, c) {
      return [
        `inn('#${c.p} .grand .mot', ${c.t0 + 0.1}, {y:50, st:0.06});`,
        sc.sous_titre ? `inn('#${c.p} .sous', ${c.t0 + 0.5}, {y:20});` : '',
        `inn('#${c.p} .bouton', ${c.at(1, 0.6)}, {s:0.7, y:0, d:0.5, e:'back.out(2)'});`,
        `tl.fromTo('#${c.p} .bouton', {scale:1}, {scale:1.05, duration:0.45, yoyo:true, repeat:3, ease:'sine.inOut', immediateRender:false}, ${c.at(1, 1.2)});`,
        sc.contact ? `inn('#${c.p} .contact', ${c.at(1, 0.9)}, {y:16});` : '',
      ].join('\n');
    },
  },

  signature: {
    aide: 'Clôture signée (ajoutée automatiquement si la charte a une signature active).',
    requis: [],
    html(sc, c) {
      const s = c.charte.signature || {};
      const logo = c.charte.logo ? logoHTML(c.charte.logo, { taille: 180, copier: c.copier }) : `<div class="sig-mono">${esc(s.nom || c.charte.nom || '')}</div>`;
      return `<div class="sig">${logo}${s.ligne ? `<div class="sig-ligne">${accent(s.ligne)}</div>` : ''}${(sc.appel || s.appel) ? `<div class="sig-appel">${accent(sc.appel || s.appel)}</div>` : ''}${s.contact ? `<div class="contact">${esc(s.contact)}</div>` : ''}</div>`;
    },
    anim(sc, c) {
      return [
        `inn('#${c.p} .sig > :first-child', ${c.t0 + 0.05}, {s:0.5, y:0, d:0.6, e:'back.out(1.8)'});`,
        `inn('#${c.p} .sig-ligne', ${c.t0 + 0.4}, {y:20});`,
        `inn('#${c.p} .sig-appel', ${c.t0 + 0.65}, {y:20});`,
        `inn('#${c.p} .contact', ${c.t0 + 0.8}, {y:16});`,
      ].join('\n');
    },
  },
};

// Coloration syntaxique minimale (déterministe, sans dépendance).
function colorer(ligne) {
  if (/^\s*(\/\/|#)/.test(ligne)) return `<span class="c-com">${esc(ligne)}</span>`;
  // Ordre important : mots-clés d'abord (aucune balise encore), puis chaînes.
  let s = esc(ligne).replace(
    /\b(GET|POST|PUT|PATCH|DELETE|query|mutation|subscription|function|const|let|return|async|await|func|type|import|from|SELECT|FROM|WHERE|def|if|else|for)\b/g,
    '<span class="c-kw">$1</span>'
  );
  s = s.replace(/(&quot;.*?&quot;)/g, '<span class="c-str">$1</span>');
  return s;
}
