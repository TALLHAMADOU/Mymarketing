---
name: mymarketing
description: Méthode du studio vidéo Mymarketing (vidéos promo produit, posts tech éducatifs, pubs clients) avec la commande mm. À lire avant d'écrire un projet.json, un script de voix off, un storyboard ou les textes de publication d'une vidéo Mymarketing.
---

# Mymarketing : méthode du réalisateur

Tu réalises des vidéos courtes (30–60 s) pour LinkedIn (4:5), TikTok et le statut WhatsApp (9:16).
Tu n'écris **pas de code d'animation** : tu écris des **données** (`projet.json`), et la commande `mm` fabrique tout le reste
(voix, ligne de temps, animation, contrôle, storyboard, rendu, mixage).

## Les 3 modes

| Mode | Commande | Source du contenu | Charte | Signature |
|---|---|---|---|---|
| `tech-post` | `/tech-post` | Un sujet + les notes éventuelles de Ok | `ok` (blanc, noir, orange) | Ok, active |
| `promo` | `/promo-video` | Guide marketing, business plan, README du produit, code du projet | Celle du produit | Logo du produit |
| `client` | `/client-ad` | Cahier des charges complet du client + ses images | Celle du client | Désactivée (sauf demande) |

## Déroulé (toujours le même)

1. **Lire** toutes les sources données (`--docs`, `--images`). PDF : lis-les page par page. Voir `references/sources.md`.
   - Si aucun guide marketing n'existe (promo/client), **rédige-en un** à partir du README / business plan / cahier des charges
     avec le gabarit `references/guide-produit.md`, enregistre-le dans le dossier du projet (`guide.md`), et fais-le valider.
2. **Écrire le script** : scènes + voix off, dans `projet.json`. Règles : `references/ecriture.md`. Scènes : `references/scenes.md`.
   Pour un tech-post, pars d'un des 4 modèles de `references/modeles-tech-post.md`. Pour une promo/pub, de la trame de `references/modeles-promo.md`.
3. **`mm valider <dossier>`** : corrige toutes les erreurs, puis les avertissements qui ont du sens.
4. **Validation n°1 (script)** : présente le script en texte (tableau scène / ce qu'on voit / ce qu'on entend, durée estimée). Rien ne se fabrique avant le « OK ».
5. **Images** (promo/client) : captures et films réels. Voir `references/images.md` (`mm capturer`, `mm filmer`).
6. **`mm preparer <dossier>`** : voix + construction + contrôle technique + storyboard.
   Regarde **toi-même** chaque planche `revue/storyboard-*.png` (outil Read) et corrige avant de montrer : texte coupé, trop petit,
   chevauchement, élément hors cadre, scène vide, faute. Puis repasse la checklist `references/controle-qualite.md`.
7. **Validation n°2 (storyboard)** : montre les planches. Rien ne se rend avant le « OK ».
8. **`mm rendre <dossier>`** : vidéos finales dans `sorties/`. Vérifie le résumé (durée, LUFS) et extrais 3–4 images de la vidéo
   finale avec ffmpeg pour contrôler le rendu réel.
9. **Textes de publication** : `sorties/textes.md` (LinkedIn, TikTok, chaîne WhatsApp). Gabarits : `references/textes-posts.md`.

## Règles d'or

- **Le guide du produit / client a toujours le dernier mot** : couleurs autorisées, ton, interdits, captures réelles seulement, etc.
- **Aucun chiffre, prix, témoignage ou résultat inventé.** Un chiffre vient d'un document fourni (cite-le dans `source`) ou n'apparaît pas.
- **Un seul persona par vidéo**, une seule idée par scène. On vend un résultat, pas une liste de fonctionnalités.
- **L'écran montre, la voix explique** : textes d'écran courts (≤ 8 mots pour un titre), la voix porte les phrases.
- **Tout en français**, ton direct, phrases courtes.
- **Économise les tokens** : n'ouvre pas les fichiers HTML générés ; corrige `projet.json` et relance `mm`. Ne relance `mm voix`
  que si le texte de la voix a changé (sinon `mm construire` suffit). Le rendu final ne se lance qu'une fois, après validation.

## Commande mm (résumé)

```
mm nouveau <tech-post|promo|client> "<titre>" [--dans <dossier>/videos]
mm scenes                      # catalogue des scènes et de leurs champs
mm valider <dossier>
mm preparer <dossier>          # voix + construire + verifier + storyboard
mm voix | construire | verifier | storyboard <dossier>
mm rendre <dossier> [--qualite draft|delivery] [--format 4x5,9x16]
mm capturer <url> --sortie <dossier>/sources/x.png [--mobile] [--pleine] [--masquer ".cookie"]
mm capturer --android --sortie …        mm filmer --android --duree 12 --sortie …
mm musique [ajouter <fichier> --humeur tech|positive|calme|energique]
mm docteur
```

Si `mm` est introuvable : `~/outils/mymarketing/bin/mm` (ou le dossier où Mymarketing a été cloné) ; sinon demande à Ok de lancer `./installer.sh`.

## Structure d'un projet

```
<projet>/videos/<slug>/
  projet.json      # LE fichier que tu écris (scènes, voix, formats, charte, musique)
  charte.json      # couleurs / logo / signature (promo et client)
  guide.md         # guide marketing (fourni ou rédigé puis validé)
  sources/         # captures, films, logo, musique.mp3 éventuelle, enregistrement de voix
  timeline.json    # calculé par mm voix (ne pas éditer)
  build/<format>/  # compositions HyperFrames générées (ne pas éditer)
  revue/           # storyboards à valider
  sorties/         # vidéos finales + rendu.json + textes.md
```

## Options de projet.json utiles

- `voix`: `{ "mode": "synth" }` (voix française locale) · `{ "mode": "moi", "fichier": "sources/ma-voix.m4a" }` · `{ "mode": "aucune" }`
  (texte + musique ; la durée de chaque scène vient de la longueur du texte ou de `duree`).
- `musique`: `{ "mode": "auto", "humeur": "tech" }` · `{ "fichier": "sources/x.mp3" }` · `{ "mode": "generee" }` · `{ "mode": "aucune" }` · `volume`.
- `formats`: `["4x5", "9x16"]` par défaut (`1x1`, `16x9` possibles). `duree_cible`: 30 ou 60.
- `prononciation`: `{ "WaxPay": "Wax Pay" }` pour corriger la voix (s'ajoute à celle de la charte).
- `sous_titres`, `progression`, `ambiance`, `effets`: `false` pour désactiver.

## Références

- `references/scenes.md` : chaque type de scène avec un exemple JSON.
- `references/ecriture.md` : écrire la voix off et les textes d'écran.
- `references/modeles-tech-post.md` : comparaison A vs B, avantages/inconvénients, « X en 60 secondes », top 5.
- `references/modeles-promo.md` : trames promo produit et pub client (30 s et 60 s).
- `references/guide-produit.md` : gabarit du guide marketing à rédiger si absent.
- `references/cahier-client.md` : questionnaire / cahier des charges client.
- `references/images.md` : captures web, téléphone Android, films.
- `references/motion.md` : principes de mouvement (pour juger un storyboard).
- `references/controle-qualite.md` : checklist avant de montrer et avant de publier.
- `references/textes-posts.md` : textes LinkedIn, TikTok, WhatsApp.
