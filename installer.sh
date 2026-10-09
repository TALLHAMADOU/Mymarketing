#!/usr/bin/env bash
# Installation de Mymarketing (Arch Linux en priorité ; marche aussi sur Debian/Ubuntu et macOS).
# Usage : ./installer.sh            (relançable sans risque)
set -euo pipefail

ICI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOTEUR="$ICI/moteur"
ok()   { printf '  \033[32mOK\033[0m  %s\n' "$*"; }
info() { printf '\n\033[1m%s\033[0m\n' "$*"; }
stop() { printf '\n\033[31mErreur :\033[0m %s\n' "$*"; exit 1; }

info "1/6 Outils système"
manque=()
command -v node    >/dev/null || manque+=(nodejs npm)
command -v ffmpeg  >/dev/null || manque+=(ffmpeg)
command -v python3 >/dev/null || manque+=(python)
command -v adb     >/dev/null || echo "  (optionnel) adb absent : nécessaire seulement pour capturer un téléphone Android."
if [ ${#manque[@]} -gt 0 ]; then
  if command -v pacman >/dev/null; then
    echo "  Installation : sudo pacman -S --needed nodejs npm ffmpeg python android-tools"
    sudo pacman -S --needed --noconfirm nodejs npm ffmpeg python android-tools
  elif command -v apt-get >/dev/null; then
    stop "installe Node.js 22+, ffmpeg et python3-venv (sudo apt install ffmpeg python3-venv ; Node 22 via nodesource ou nvm), puis relance."
  elif command -v brew >/dev/null; then
    brew install node ffmpeg python
  else
    stop "installe : ${manque[*]}, puis relance."
  fi
fi
NODE_MAJ=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJ" -ge 22 ] || stop "Node.js $NODE_MAJ détecté, il faut Node.js 22 ou plus."
ok "node $(node -v), $(ffmpeg -version | head -1 | cut -d' ' -f1-3), $(python3 --version)"

info "2/6 Moteur de rendu (HyperFrames, GSAP, polices, icônes)"
cd "$MOTEUR"
npm ci --no-audit --no-fund --loglevel=error
./node_modules/.bin/hyperframes telemetry disable >/dev/null 2>&1 || true
ok "dépendances Node installées"

info "3/6 Python (voix française Kokoro + sons)"
if [ ! -x "$MOTEUR/.venv/bin/python" ]; then
  python3 -m venv "$MOTEUR/.venv" || stop "python3 -m venv a échoué (Debian/Ubuntu : sudo apt install python3-venv)."
fi
"$MOTEUR/.venv/bin/pip" install --quiet --upgrade pip
"$MOTEUR/.venv/bin/pip" install --quiet numpy kokoro-onnx soundfile
ok "environnement Python : $MOTEUR/.venv"

info "4/6 Navigateur de rendu (Chrome headless)"
if [ -n "${HYPERFRAMES_BROWSER_PATH:-}" ]; then
  ok "HYPERFRAMES_BROWSER_PATH=$HYPERFRAMES_BROWSER_PATH"
else
  ./node_modules/.bin/hyperframes browser ensure || stop "téléchargement de Chrome impossible. Tu peux définir HYPERFRAMES_BROWSER_PATH=/usr/bin/chromium (pacman -S chromium)."
  ok "Chrome prêt"
fi

info "5/6 Commande mm"
mkdir -p "$HOME/.local/bin"
ln -sf "$ICI/bin/mm" "$HOME/.local/bin/mm"
chmod +x "$ICI/bin/mm"
case ":$PATH:" in
  *":$HOME/.local/bin:"*) ok "mm disponible partout" ;;
  *) echo "  Ajoute ~/.local/bin à ton PATH (ex. dans ~/.bashrc ou ~/.zshrc) :"
     echo '    export PATH="$HOME/.local/bin:$PATH"' ;;
esac
mkdir -p "$ICI/bibliotheque/musique/"{tech,positive,calme,energique}

info "6/6 Premier essai de la voix (télécharge le modèle Kokoro la première fois, ~300 Mo)"
TMP_DIR="$(mktemp -d)"; TMP_WAV="$TMP_DIR/essai.wav"
HYPERFRAMES_PYTHON="$MOTEUR/.venv/bin/python" ./node_modules/.bin/hyperframes tts "Mymarketing est prêt." --voice ff_siwis --lang fr-fr -o "$TMP_WAV" --json >/dev/null \
  && ok "voix française fonctionnelle" || echo "  La voix n'a pas pu être testée : relance plus tard avec une connexion (mm docteur)."
rm -rf "$TMP_DIR"

echo
"$ICI/bin/mm" docteur || true
cat <<EOF

Installation terminée.

Brancher Mymarketing dans Claude Code (une seule fois) :
  claude plugin marketplace add "$ICI"
  claude plugin install mymarketing@mymarketing

Puis, dans Claude Code :
  /tech-post "REST vs GraphQL"
  /promo-video --docs docs/guide-marketing.pdf
  /client-ad "Nom du client" --docs ~/clients/x/cahier-des-charges.pdf --images ~/clients/x/images

Musique : ajoute des pistes libres de droits (ex. mixkit.co/free-stock-music) avec
  mm musique ajouter ~/Téléchargements/piste.mp3 --humeur tech
EOF
