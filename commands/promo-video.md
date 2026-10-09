---
description: Vidéo promo d'un de tes produits (APK, SaaS, logiciel) à partir de ses documents (guide marketing, business plan, README) et de vraies captures
argument-hint: [--docs guide.pdf,README.md] [--images sources/captures|<url de démo>|android] [--cible <persona>] [--duree 30|60] [--voix synth|moi|aucune] [--formats 4x5,9x16] [--serie] [--dans videos]
---

Tu orchestres une **vidéo promo produit** Mymarketing. Arguments reçus : `$ARGUMENTS`

Paramètres (tous optionnels) :
- `--docs` : documents existants, séparés par des virgules (guide marketing, business plan, README commercial, PDF…). Ils sont lus en priorité
  et **leurs règles priment**. Sans `--docs`, le réalisateur cherche dans le projet courant ; s'il n'y a pas de guide, il en rédige un à valider.
- `--images` : dossier de captures, URL d'une instance de démo à capturer, ou `android` (téléphone branché en USB).
- `--cible` : le persona visé. Sans `--cible`, le réalisateur choisit le persona le plus important du guide et le dit.
- `--serie` : prépare une vidéo **par persona** du guide (même méthode, une à la fois, validations à chaque vidéo).
- `--duree` : 60 par défaut (30 pour une version courte). `--voix` : synth par défaut. `--formats` : 4x5,9x16 par défaut.
- `--dans` : dossier de sortie, par défaut `./videos` dans le projet courant.

Charte : celle du produit (lue dans ses documents ou son code). Signature : logo du produit.

## Déroulé

Le travail est fait par l'agent **realisateur**, en trois phases. Toi, tu présentes ses rapports à Ok et tu recueilles ses validations.
Garde l'identifiant de l'agent pour lui renvoyer les phases suivantes (SendMessage).

1. **Phase SCRIPT** — lance l'agent `realisateur` avec : le mode `promo`, le dossier du projet courant, tous les paramètres ci-dessus et
   la consigne « Phase SCRIPT ». Présente : le persona, le tableau du script, la durée, les images prévues, et le `guide.md` s'il a été rédigé.
   Demande la validation (AskUserQuestion : « Valider » / « Modifier »). Boucle avec « Phase CORRECTION » tant que Ok modifie.
2. **Phase STORYBOARD** — envoie « Phase STORYBOARD ». Si l'agent a besoin d'une action d'Ok (téléphone à brancher, écran à ouvrir,
   compte de démo), relaie la demande telle quelle, attends, puis relance la phase. Montre les deux planches et demande la validation.
3. **Phase RENDU** — envoie « Phase RENDU ». Termine avec les chemins des vidéos, le texte LinkedIn prêt à copier et le chemin de `textes.md`.

Avec `--serie` : après la première vidéo, propose la suivante (persona suivant) et recommence au point 1.
