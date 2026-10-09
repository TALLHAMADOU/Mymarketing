// Captures d'écran réelles : une page web (instance de démo, site) ou un téléphone Android branché en USB.
import fs from 'node:fs';
import path from 'node:path';
import { ErreurMM, hf, log, run } from './util.mjs';

function cheminChrome() {
  if (process.env.HYPERFRAMES_BROWSER_PATH) return process.env.HYPERFRAMES_BROWSER_PATH;
  const r = hf(['browser', 'path'], { tolerer: true });
  const p = r.stdout.trim().split('\n').pop();
  if (r.status !== 0 || !p || !fs.existsSync(p)) throw new ErreurMM('Chrome de rendu introuvable : relance ./installer.sh');
  return p;
}

// Page web. opts : largeur, hauteur, mobile (true = 390x844 @3x), attendre (ms), cliquer (sélecteur), pleine (page entière),
// cookie / entetes pour une session de démo, masquer (sélecteurs à cacher, ex. bandeau cookies).
export async function capturerWeb(url, sortie, opts = {}) {
  const puppeteer = (await import('puppeteer-core')).default;
  const mobile = !!opts.mobile;
  const vp = mobile
    ? { width: +opts.largeur || 390, height: +opts.hauteur || 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { width: +opts.largeur || 1440, height: +opts.hauteur || 900, deviceScaleFactor: 2 };
  const nav = await puppeteer.launch({ executablePath: cheminChrome(), headless: true, args: ['--no-sandbox', '--hide-scrollbars'] });
  try {
    const page = await nav.newPage();
    await page.setViewport(vp);
    if (opts.entetes) await page.setExtraHTTPHeaders(opts.entetes);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    if (opts.cliquer) {
      await page.click(opts.cliquer);
      await new Promise((r) => setTimeout(r, 800));
    }
    if (opts.masquer) await page.addStyleTag({ content: `${opts.masquer} { display: none !important; }` });
    await new Promise((r) => setTimeout(r, +opts.attendre || 600));
    fs.mkdirSync(path.dirname(sortie), { recursive: true });
    await page.screenshot({ path: sortie, fullPage: !!opts.pleine, type: 'png' });
  } finally {
    await nav.close();
  }
  log(`Capture : ${sortie}`);
  return sortie;
}

export function adbDisponible() {
  const r = run('adb', ['devices'], { tolerer: true });
  const lignes = (r.stdout || '').split('\n').slice(1).filter((l) => /\tdevice$/.test(l.trim()) || /\sdevice$/.test(l));
  return lignes.length > 0;
}

// Téléphone Android : débogage USB activé, téléphone déverrouillé sur l'écran voulu.
export function capturerAndroid(sortie) {
  if (!adbDisponible()) throw new ErreurMM('Aucun téléphone Android détecté. Branche-le en USB, active le débogage USB et accepte la clé sur le téléphone (adb devices doit lister "device").');
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  const r = run('adb', ['exec-out', 'screencap', '-p'], { encoding: 'buffer' });
  fs.writeFileSync(sortie, r.stdout);
  log(`Capture Android : ${sortie}`);
  return sortie;
}

// Enregistre l'écran du téléphone (max 180 s, limite d'Android) en MP4.
export function filmerAndroid(sortie, duree = 10) {
  if (!adbDisponible()) throw new ErreurMM('Aucun téléphone Android détecté (voir mm capturer --android).');
  const distant = '/sdcard/mymarketing-film.mp4';
  log(`Enregistrement de ${duree} s : fais la démonstration sur le téléphone maintenant…`);
  run('adb', ['shell', 'screenrecord', '--time-limit', String(Math.min(180, duree)), distant]);
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  run('adb', ['pull', distant, sortie]);
  run('adb', ['shell', 'rm', distant], { tolerer: true });
  log(`Film Android : ${sortie}`);
  return sortie;
}
