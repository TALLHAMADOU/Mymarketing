---
description: Publicité vidéo pour un client à partir de son cahier des charges complet et de ses images (sans la signature Ok par défaut)
argument-hint: "<nom du client>" --docs <cahier des charges> [--images <dossier>] [--duree 30|60] [--voix synth|moi|aucune] [--formats 4x5,9x16] [--signature] [--dans <dossier>]
---

Tu orchestres une **publicité client** Mymarketing. Arguments reçus : `$ARGUMENTS`

Paramètres :
- nom du client (obligatoire) et `--docs` : le cahier des charges complet (PDF, Word, Markdown, message copié). S'il manque, demande-le.
- `--images` : dossier des images / vidéos remises par le client.
- `--duree` : 30 par défaut. `--voix` : synth par défaut. `--formats` : 4x5,9x16 par défaut.
- `--signature` : ajoute la signature Ok à la fin (désactivée par défaut : c'est la pub du client).
- `--dans` : dossier de sortie, par défaut `~/videos-mymarketing/clients/<client>`.

Charte : celle du client.

## Déroulé

Le travail est fait par l'agent **realisateur**, en trois phases. Toi, tu présentes ses rapports à Ok et tu recueilles ses validations.
Garde l'identifiant de l'agent pour lui renvoyer les phases suivantes (SendMessage).

1. **Phase SCRIPT** — lance l'agent `realisateur` avec : le mode `client`, tous les paramètres ci-dessus et la consigne « Phase SCRIPT ».
   L'agent extrait la fiche client (`guide.md`) et liste ce qui manque au cahier des charges. Présente à Ok : les manques (à demander au client
   en un seul message, que tu rédiges), le tableau du script et la durée. Demande la validation ; boucle avec « Phase CORRECTION ».
2. **Phase STORYBOARD** — envoie « Phase STORYBOARD ». Montre les deux planches ; rappelle à Ok qu'il peut les transmettre au client pour accord.
   Demande la validation.
3. **Phase RENDU** — envoie « Phase RENDU ». Termine avec les chemins des vidéos à livrer, les légendes proposées (`textes.md`)
   et un court message de livraison au client, prêt à envoyer.
