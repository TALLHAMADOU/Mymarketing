// Feuille de style commune à toutes les scènes. Les couleurs viennent de la charte.
export const MISE_EN_PAGE = {
  '4x5': { u: 1, padx: 72, haut: 110, bas: 210, st: 64 },
  '9x16': { u: 1.15, padx: 64, haut: 200, bas: 470, st: 340 },
  '1x1': { u: 0.9, padx: 64, haut: 90, bas: 190, st: 52 },
  '16x9': { u: 0.9, padx: 150, haut: 90, bas: 200, st: 58 },
};

export function css(charte, fmt) {
  const c = charte.couleurs;
  const m = MISE_EN_PAGE[fmt];
  return `
@font-face{font-family:"Inter";src:url("fonts/inter-latin.woff2") format("woff2");font-weight:100 900;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Inter";src:url("fonts/inter-latin-ext.woff2") format("woff2");font-weight:100 900;unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"JetBrains Mono";src:url("fonts/jbm-500.woff2") format("woff2");font-weight:500}
@font-face{font-family:"JetBrains Mono";src:url("fonts/jbm-700.woff2") format("woff2");font-weight:700}
:root{--fond:${c.fond};--surface:${c.surface};--encre:${c.encre};--douce:${c.encre_douce};--accent:${c.accent};--accent-texte:${c.accent_texte || c.accent};--sur-accent:${c.sur_accent};--ligne:${c.ligne};--ok:${c.positif};--ko:${c.negatif};--code:${c.code_fond};--u:${m.u}}
*{box-sizing:border-box}
body{margin:0;background:var(--fond)}
#root{position:relative;width:100%;height:100%;overflow:hidden;background:var(--fond);color:var(--encre);font-family:"Inter",sans-serif;font-feature-settings:"ss01","cv11";-webkit-font-smoothing:antialiased}
em{font-style:normal;color:var(--accent-texte)}
.scene{position:absolute;inset:0}
.stage{position:absolute;left:${m.padx}px;right:${m.padx}px;top:${m.haut}px;bottom:${m.bas}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(36px*var(--u));text-align:center}
.mot{display:inline-block}
.grand{margin:0;font-weight:800;letter-spacing:-0.035em;line-height:1.02}
.moyen{margin:0;font-size:calc(58px*var(--u));font-weight:800;letter-spacing:-0.03em;line-height:1.08}
.surtitre{font-size:calc(30px*var(--u));font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent-texte)}
.sous{margin:0;font-size:calc(38px*var(--u));font-weight:500;color:var(--douce);line-height:1.3;max-width:calc(860px*var(--u))}
.para{margin:0;font-weight:600;line-height:1.3;letter-spacing:-0.01em}
.accroche{font-weight:850;letter-spacing:-0.04em;line-height:1.04}
.accroche .ligne{display:block}
.logos{display:flex;gap:calc(40px*var(--u));align-items:center;justify-content:center}
.logo{display:flex;align-items:center;justify-content:center;flex:none}
.logo.mono{border-radius:22%;background:var(--encre);color:var(--fond);font-weight:850;letter-spacing:-0.02em}
.ico{display:inline-flex;flex:none;width:1.15em;height:1.15em;border-radius:50%;align-items:center;justify-content:center;padding:0.2em}
.ico svg{width:100%;height:100%}
.ico.ok{background:var(--ok);color:#fff}
.ico.ko{background:var(--ko);color:#fff}
/* versus */
.vs{display:flex;align-items:center;justify-content:center;gap:calc(26px*var(--u));width:100%}
.vs-carte{flex:1;max-width:calc(420px*var(--u));background:var(--surface);border-radius:calc(36px*var(--u));padding:calc(48px*var(--u)) calc(24px*var(--u));display:flex;flex-direction:column;align-items:center;gap:calc(22px*var(--u))}
.vs-nom{font-weight:850;letter-spacing:-0.03em}
.vs-sous{font-size:calc(30px*var(--u));color:var(--douce);font-weight:500;line-height:1.25}
.vs-badge{flex:none;width:calc(104px*var(--u));height:calc(104px*var(--u));border-radius:50%;background:var(--accent);color:var(--sur-accent);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:calc(38px*var(--u))}
/* tableau */
.tableau{width:100%;display:flex;flex-direction:column;gap:calc(14px*var(--u))}
.tb-ligne{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:calc(14px*var(--u));align-items:stretch}
.tb-ligne>div{padding:calc(22px*var(--u)) calc(18px*var(--u));border-radius:calc(20px*var(--u));display:flex;align-items:center;justify-content:center;gap:0.4em;line-height:1.2;font-weight:600}
.tb-tete>div{background:none;font-weight:850;font-size:1.15em}
.tb-col{flex-direction:column}
.tb-crit{background:var(--surface);justify-content:flex-start!important;text-align:left;font-weight:700!important}
.tb-val{background:var(--surface);color:var(--encre)}
.tb-val.gagne{background:var(--encre);color:var(--fond)}
.tb-val.gagne em{color:var(--accent)}
/* pour / contre */
.pc{display:grid;grid-template-columns:1fr 1fr;gap:calc(24px*var(--u));width:100%;text-align:left}
.pc-col{display:flex;flex-direction:column;gap:calc(16px*var(--u))}
.pc-lib{font-size:calc(30px*var(--u));font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding-bottom:calc(8px*var(--u));border-bottom:calc(4px*var(--u)) solid var(--encre)}
.pc-col.pour .pc-lib{color:var(--ok);border-color:var(--ok)}
.pc-col.contre .pc-lib{color:var(--ko);border-color:var(--ko)}
.pc-item{display:flex;gap:0.55em;align-items:flex-start;background:var(--surface);border-radius:calc(20px*var(--u));padding:calc(20px*var(--u));font-weight:600;line-height:1.22}
/* liste & étapes */
.liste,.etapes{width:100%;display:flex;flex-direction:column;gap:calc(18px*var(--u));text-align:left;position:relative}
.li,.et{display:flex;gap:calc(26px*var(--u));align-items:center;background:var(--surface);border-radius:calc(24px*var(--u));padding:calc(22px*var(--u)) calc(28px*var(--u))}
.li-num,.et-pt{flex:none;width:calc(72px*var(--u));height:calc(72px*var(--u));border-radius:50%;background:var(--accent);color:var(--sur-accent);display:flex;align-items:center;justify-content:center;font-weight:850;font-size:calc(36px*var(--u))}
.li-num svg{width:55%;height:55%}
.li-t{font-weight:750;line-height:1.18;letter-spacing:-0.01em}
.li-d{font-size:0.78em;color:var(--douce);font-weight:500;margin-top:0.25em;line-height:1.25}
.et{background:none;padding-left:0;position:relative;z-index:1}
.et-rail{position:absolute;left:calc(36px*var(--u));top:calc(40px*var(--u));bottom:calc(40px*var(--u));width:calc(6px*var(--u));margin-left:calc(-3px*var(--u));background:var(--ligne);border-radius:3px;z-index:0}
/* code */
.codes{width:100%;display:flex;flex-direction:column;gap:calc(26px*var(--u))}
.code{background:var(--code);border-radius:calc(26px*var(--u));overflow:hidden;text-align:left;box-shadow:0 calc(20px*var(--u)) calc(50px*var(--u)) rgba(0,0,0,0.18)}
.code-barre{display:flex;gap:calc(10px*var(--u));align-items:center;padding:calc(18px*var(--u)) calc(24px*var(--u));background:rgba(255,255,255,0.05)}
.code-barre i{width:calc(16px*var(--u));height:calc(16px*var(--u));border-radius:50%;background:#3a3d44}
.code-barre span{margin-left:calc(14px*var(--u));color:#9aa0aa;font:500 calc(26px*var(--u)) "JetBrains Mono",monospace}
.code pre{margin:0;padding:calc(26px*var(--u)) calc(30px*var(--u));color:#e8e6e1;font-family:"JetBrains Mono",monospace;font-weight:500;line-height:1.5;white-space:pre}
.c-kw{color:var(--accent);font-weight:700}
.c-str{color:#9be29b}
.c-com{color:#7b818c}
/* chiffre */
.chiffre{display:flex;flex-direction:column;align-items:center;gap:calc(18px*var(--u))}
.ch-masque{overflow:hidden;padding:0 0.05em}
.ch-val{font-weight:900;letter-spacing:-0.05em;line-height:1;color:var(--encre)}
.ch-unite{font-size:calc(46px*var(--u));font-weight:750;color:var(--accent-texte)}
.ch-barre{width:calc(260px*var(--u));height:calc(10px*var(--u));border-radius:5px;background:var(--accent)}
.ch-leg{margin:0;font-size:calc(42px*var(--u));font-weight:600;line-height:1.28;max-width:calc(860px*var(--u))}
.ch-src{font-size:calc(24px*var(--u));color:var(--douce)}
/* capture */
.cap{position:relative;border-radius:calc(28px*var(--u));overflow:hidden;background:var(--surface);box-shadow:0 calc(30px*var(--u)) calc(80px*var(--u)) rgba(0,0,0,0.20);flex:none}
.cadre-telephone{border:calc(16px*var(--u)) solid #0b0b0b;border-radius:calc(64px*var(--u))}
.cadre-aucun{box-shadow:none;background:none}
.nav-barre{height:54px;display:flex;align-items:center;gap:10px;padding:0 20px;background:#ECEAE6}
.nav-barre i{width:14px;height:14px;border-radius:50%;background:#C9C6C0}
.nav-barre span{margin-left:16px;flex:1;height:32px;border-radius:16px;background:#fff;color:#5E5E5E;font-size:20px;display:flex;align-items:center;padding:0 16px;text-align:left}
.cap-vue{position:relative;overflow:hidden}
.cap-img{position:absolute;left:0;top:0}
.cap-img img{display:block}
.cap-zone{position:absolute;border:5px solid var(--accent);border-radius:16px;box-shadow:0 0 0 9999px rgba(0,0,0,0.18)}
.cap-curseur{position:absolute;left:0;top:0;width:44px;height:62px;z-index:3}
.cap-curseur svg{width:100%;height:100%}
.cap-onde{position:absolute;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;border:5px solid var(--accent);z-index:2;opacity:0}
/* avant / après */
.aas{width:100%;display:flex;flex-direction:column;align-items:stretch;gap:calc(18px*var(--u));text-align:left}
.aa{border-radius:calc(28px*var(--u));padding:calc(28px*var(--u));display:flex;flex-direction:column;gap:calc(14px*var(--u))}
.aa.avant{background:var(--surface);color:var(--douce)}
.aa.apres{background:var(--encre);color:var(--fond)}
.aa-t{font-size:calc(30px*var(--u));font-weight:800;letter-spacing:0.12em;text-transform:uppercase}
.aa.apres .aa-t{color:var(--accent)}
.aa-i{display:flex;gap:0.55em;align-items:center;font-weight:600;line-height:1.22}
.aa-fleche{align-self:center;width:calc(64px*var(--u));height:calc(64px*var(--u));color:var(--accent);transform-origin:50% 50%}
.aa-fleche svg{width:100%;height:100%;rotate:90deg}
/* citation */
.cit{display:flex;flex-direction:column;align-items:center;gap:calc(28px*var(--u))}
.cit-g{width:calc(96px*var(--u));color:var(--accent)}
.cit blockquote{margin:0;font-weight:650;line-height:1.28;letter-spacing:-0.015em}
.cit-a{display:flex;flex-direction:column;gap:calc(6px*var(--u));font-size:calc(32px*var(--u))}
.cit-a span{color:var(--douce);font-size:0.85em}
/* appel & signature */
.bouton{background:var(--accent);color:var(--sur-accent);font-weight:800;font-size:calc(44px*var(--u));padding:calc(30px*var(--u)) calc(56px*var(--u));border-radius:calc(80px*var(--u))}
.contact{font-size:calc(34px*var(--u));font-weight:650;color:var(--douce)}
.sig{display:flex;flex-direction:column;align-items:center;gap:calc(26px*var(--u))}
.sig-mono{min-width:calc(200px*var(--u));height:calc(200px*var(--u));padding:0 calc(36px*var(--u));border-radius:calc(48px*var(--u));background:var(--encre);color:var(--fond);font-weight:900;font-size:calc(96px*var(--u));letter-spacing:-0.05em;display:flex;align-items:center;justify-content:center}
.sig-ligne{font-size:calc(46px*var(--u));font-weight:800;letter-spacing:-0.02em}
.sig-appel{font-size:calc(36px*var(--u));font-weight:600;color:var(--accent-texte)}
/* habillage */
.amb{position:absolute;width:120%;height:70%;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--accent) 9%,transparent),transparent);pointer-events:none}
#amb1{left:-40%;top:-20%}
#amb2{right:-45%;bottom:-15%;background:radial-gradient(closest-side,color-mix(in srgb,var(--encre) 3%,transparent),transparent)}
.prog{position:absolute;left:0;top:0;width:100%;height:calc(8px*var(--u));background:var(--accent);transform-origin:0% 50%}
.marque{position:absolute;left:${m.padx}px;top:calc(${Math.round(m.haut * 0.36)}px);display:flex;align-items:center;gap:12px;font-weight:850;font-size:calc(30px*var(--u));letter-spacing:-0.02em;color:var(--encre)}
.marque b{display:inline-flex;align-items:center;justify-content:center;min-width:calc(52px*var(--u));height:calc(52px*var(--u));padding:0 calc(10px*var(--u));border-radius:calc(14px*var(--u));background:var(--encre);color:var(--fond);font-size:calc(26px*var(--u))}
.marque img{height:calc(52px*var(--u));width:auto}
.sous-titres{position:absolute;left:${m.padx}px;right:${m.padx}px;bottom:${m.st}px;height:calc(120px*var(--u));display:flex;align-items:center;justify-content:center}
.st{position:absolute;left:0;right:0;margin:auto;width:fit-content;max-width:100%;background:var(--encre);color:var(--fond);font-weight:750;font-size:calc(40px*var(--u));line-height:1.2;padding:calc(14px*var(--u)) calc(26px*var(--u));border-radius:calc(18px*var(--u));text-align:center;opacity:0}
.st em{color:var(--accent)}
.aa.apres em,.tb-val.gagne em,.code em{color:var(--accent)}
`;
}
