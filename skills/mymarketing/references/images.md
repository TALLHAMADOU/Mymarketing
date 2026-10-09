# Images réelles : captures et films

Tout va dans `<projet vidéo>/sources/`. Choisis la source selon ce que `--images` indique :

## 1. Dossier de captures existant
Copie les fichiers utiles dans `sources/` (ne modifie jamais les originaux). Regarde-les (outil Read) pour choisir les zones de `zoom` / `clic`.
Les fractions `zoom` et `clic` se mesurent sur l'image : `x = position horizontale / largeur`.

## 2. URL (instance de démo, site, app web)
```bash
mm capturer "https://demo.exemple.com/caisse" --sortie videos/x/sources/caisse.png                 # bureau 1440×900 @2x
mm capturer "https://demo.exemple.com" --mobile --sortie videos/x/sources/accueil-mobile.png        # téléphone 390×844 @3x
mm capturer "<url>" --pleine --masquer ".cookie-banner" --attendre 1500 --sortie …
```
- Page derrière une connexion : demande à Ok une URL de démo déjà connectée ou un compte de démo ; n'utilise jamais de vrais comptes clients.
- Données à l'écran : uniquement des données de démonstration (noms fictifs), jamais de données personnelles réelles.

## 3. Téléphone Android en USB (APK)
Prérequis : débogage USB activé, téléphone autorisé (`adb devices` affiche `device`), écran déverrouillé.
```bash
mm capturer --android --sortie videos/x/sources/ecran-accueil.png       # capture de l'écran actuel
mm filmer --android --duree 12 --sortie videos/x/sources/demo.mp4       # Ok fait la démo pendant 12 s
```
Demande à Ok de mettre l'app sur le bon écran avant chaque capture (une capture = un écran). Pour un film, donne-lui le scénario des gestes.

## 4. Projet Flutter sans téléphone
Si l'app tourne en web (`flutter run -d chrome` / `flutter build web`), capture-la avec `mm capturer --mobile` sur l'URL locale.

## 5. Pas d'image possible
Si le guide autorise les maquettes : scènes `etapes`, `liste`, `avant_apres` sans capture. Si le guide exige des captures réelles
(« jamais une maquette »), arrête-toi et demande les captures : ne redessine pas l'interface.

## Bonnes captures
- Un écran = un résultat visible (la quittance, le tableau de bord, la notification), pas un menu.
- Zoome (`zoom`) sur la zone qui prouve le résultat ; en 4:5 et 9:16 un écran entier de bureau est illisible.
- Captures de bureau → cadre `navigateur` ; captures/films de téléphone → cadre `telephone`.
