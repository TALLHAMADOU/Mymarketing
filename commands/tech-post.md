---
description: Vidéo tech éducative (comparaison, avantages/inconvénients, « X en 60 s », top 5) pour LinkedIn, TikTok et WhatsApp, à la charte Ok
argument-hint: "<sujet>" [--modele comparaison|pour-contre|explication|top5] [--docs notes.md] [--duree 30|60] [--voix synth|moi|aucune] [--formats 4x5,9x16] [--dans <dossier>]
---

Tu orchestres la création d'un **tech-post** Mymarketing. Arguments reçus : `$ARGUMENTS`

Paramètres (tous optionnels sauf le sujet) :
- sujet : le thème du post (ex. « REST vs GraphQL »). S'il manque, demande-le.
- `--modele` : comparaison | pour-contre | explication | top5 (sinon le réalisateur choisit).
- `--docs` : notes ou brouillon d'Ok à respecter. `--duree` : 60 par défaut. `--voix` : synth par défaut
  (`moi` : Ok enregistrera sa voix ; demande-lui le fichier au moment du storyboard). `--formats` : 4x5,9x16 par défaut.
- `--dans` : dossier de sortie, par défaut `~/videos-mymarketing/tech-posts`.

Charte : `ok` (blanc, noir, orange), signature Ok active.

## Déroulé

Le travail est fait par l'agent **realisateur**, en trois phases. Toi, tu présentes ses rapports à Ok et tu recueilles ses validations.
Garde l'identifiant de l'agent pour lui renvoyer les phases suivantes (SendMessage) au lieu d'en relancer un nouveau.

1. **Phase SCRIPT** — lance l'agent `realisateur` avec : le mode `tech-post`, tous les paramètres ci-dessus, et la consigne
   « Phase SCRIPT ». Présente à Ok le tableau du script, la durée et les points à confirmer. Demande la validation
   (AskUserQuestion : « Valider le script » / « Modifier »). S'il modifie : renvoie ses remarques à l'agent (« Phase CORRECTION, script »)
   et représente le script. Ne passe pas à la suite sans « Valider ».
2. **Phase STORYBOARD** — envoie « Phase STORYBOARD » à l'agent. Montre les deux planches à Ok (donne leurs chemins ; si l'outil d'envoi
   de fichier est disponible, envoie-les). Demande la validation du storyboard de la même façon.
3. **Phase RENDU** — envoie « Phase RENDU ». Termine en donnant : les chemins des vidéos (4:5 pour LinkedIn, 9:16 pour TikTok/WhatsApp),
   le texte LinkedIn prêt à copier, et le chemin de `textes.md`.

Si Ok a dit de tout faire sans s'arrêter (ex. « sans validation »), enchaîne les trois phases et signale à la fin ce qui aurait mérité son avis.
