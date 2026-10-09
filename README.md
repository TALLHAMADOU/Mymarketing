# Mymarketing

Studio vidéo marketing de **Ok** dans Claude Code. Trois commandes, un seul moteur :

| Commande | Pour | Sortie |
|---|---|---|
| `/tech-post "<sujet>"` | Tes posts tech (REST vs GraphQL, avantages/inconvénients, « X en 60 s », top 5) | Vidéos à ta charte (blanc, noir, orange), signées Ok |
| `/promo-video` | Tes produits (APK, SaaS, logiciels), à partir de leurs documents et de vraies captures | Vidéos à la charte du produit |
| `/client-ad "<client>"` | Les pubs que tu réalises pour des clients, à partir de leur cahier des charges | Vidéos à la charte du client, sans ta signature |

Chaque vidéo sort en **4:5** (LinkedIn) et **9:16** (TikTok, statut et chaîne WhatsApp), avec voix off française, sous-titres,
musique, effets sonores, son normalisé à −14 LUFS, et les **textes de publication** (LinkedIn, TikTok, WhatsApp).

Claude ne fabrique rien sans ton accord : **1.** il te montre le script, **2.** il te montre le storyboard (images fixes de chaque scène),
**3.** seulement ensuite il rend les vidéos.

## Installation (Arch Linux)

```bash
mkdir -p ~/outils && cd ~/outils
git clone https://github.com/TALLHAMADOU/mymarketing.git
cd mymarketing
./installer.sh
```

L'installeur installe ce qui manque (`nodejs npm ffmpeg python android-tools` via pacman), le moteur (HyperFrames + GSAP),
un environnement Python pour la voix française (Kokoro, locale et gratuite), le navigateur de rendu, et la commande `mm`
dans `~/.local/bin`. Il se relance sans risque (par exemple après une mise à jour : `git pull && ./installer.sh`).

Puis, une seule fois, branche le plugin dans Claude Code :

```bash
claude plugin marketplace add ~/outils/mymarketing
claude plugin install mymarketing@mymarketing
```

Vérification à tout moment : `mm docteur`.

## Utilisation

```text
/tech-post "REST vs GraphQL"
/tech-post "C'est quoi Docker ?" --modele explication --duree 30
/promo-video --docs docs/business-plan.md,docs/plan-marketing.pdf --images https://demo.monapp.com --cible directeur
/promo-video --images android --duree 30
/client-ad "Boutique Wend" --docs ~/clients/wend/cahier-des-charges.pdf --images ~/clients/wend/photos
```

Paramètres communs : `--docs` (documents existants, lus en priorité), `--images` (dossier, URL à capturer ou `android`),
`--cible` (persona), `--duree 30|60`, `--voix synth|moi|aucune`, `--formats 4x5,9x16`, `--dans <dossier>`.

Où vont les vidéos :
- `/promo-video` → `videos/<titre>/sorties/` dans le projet du produit ;
- `/tech-post` → `~/videos-mymarketing/tech-posts/<titre>/sorties/` ;
- `/client-ad` → `~/videos-mymarketing/clients/<client>/<titre>/sorties/`.

Exemple complet déjà rendu : `exemples/rest-vs-graphql/` (script dans `projet.json`, vidéos dans `sorties/`).

## Ta propre voix

`--voix moi` : enregistre-toi au téléphone en lisant le script validé, dépose le fichier (m4a, mp3, wav) dans `sources/` du projet vidéo.
L'outil transcrit l'enregistrement et cale les animations sur tes phrases.

## Musique

Sans bibliothèque, un fond musical discret est **généré** automatiquement (aucun problème de droits). Pour un son plus riche,
télécharge des pistes libres de droits pour un usage commercial (par exemple sur [Mixkit](https://mixkit.co/free-stock-music/),
licence Mixkit) et ajoute-les :

```bash
mm musique ajouter ~/Téléchargements/piste.mp3 --humeur tech      # humeurs : tech, positive, calme, energique
```

Une musique précise pour une vidéo : dépose-la en `sources/musique.mp3` du projet vidéo.

## La commande `mm` (utilisée par Claude, utilisable à la main)

```text
mm nouveau <tech-post|promo|client> "<titre>"    mm scenes          mm valider <dossier>
mm preparer <dossier>   (voix + construction + contrôle + storyboard)
mm rendre <dossier>     (vidéos finales)          mm docteur
mm capturer <url> --sortie x.png [--mobile]       mm capturer --android --sortie x.png
mm filmer --android --duree 12 --sortie demo.mp4  mm musique [ajouter …]
```

## Organisation du dépôt

```
.claude-plugin/   manifeste du plugin Claude Code
commands/         /tech-post, /promo-video, /client-ad
agents/           realisateur : l'agent qui fait tout le travail
skills/mymarketing/  méthode, catalogue des scènes, modèles, checklists
bin/mm            ligne de commande
moteur/           rendu (HyperFrames + GSAP), voix, audio, captures
chartes/ok.json   ta charte (blanc, noir, orange, signature Ok)
bibliotheque/     musique
exemples/         vidéo de démonstration REST vs GraphQL
```

Crédits et licences des composants : `CREDITS.md`.
