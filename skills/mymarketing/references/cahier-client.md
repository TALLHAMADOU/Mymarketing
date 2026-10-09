# Cahier des charges client (`/client-ad`)

Le client remet un cahier des charges complet (PDF, Word, Markdown, message WhatsApp copié) + ses images.
Ton travail : en extraire la fiche ci-dessous, la compléter avec ses images, et **lister ce qui manque** en une seule fois.

## Fiche à remplir (enregistre-la en `guide.md` dans le dossier du projet)

| Rubrique | Contenu attendu | Obligatoire |
|---|---|---|
| Client | Raison sociale, contact pour la validation | oui |
| Produit / service | Ce que c'est, en une phrase | oui |
| Objectif de la vidéo | Ventes, notoriété, lancement, événement… | oui |
| Cible (persona) | Qui doit agir après la vidéo | oui |
| Message clé | La phrase que la cible doit retenir | oui |
| Douleur / besoin | Ce que vit la cible avant | oui |
| Preuves | Chiffres réels (source), témoignages autorisés, labels | non |
| Offre | Prix, promo, dates — exactement comme le client l'écrit | non |
| Appel à l'action | Une action + le contact (WhatsApp, adresse, site) | oui |
| Charte | Logo (PNG/SVG), couleurs, police si imposée, exemples de pubs aimées / détestées | logo oui |
| Images | Photos produit, captures, vidéos ; droits d'utilisation confirmés | oui |
| Formats & durée | 30 s par défaut ; 9:16 + 4:5 ; autres plateformes | non |
| Voix | Voix de synthèse, voix enregistrée fournie, ou sans voix | non |
| Mentions légales | Conditions de l'offre, mentions obligatoires du secteur | si besoin |
| Interdits | Mots, concurrents à ne pas citer, couleurs à éviter | non |
| Délai & nombre d'allers-retours | | non |

## Règles spécifiques client
- **Signature « Ok » désactivée** par défaut (`"signature": false`). Avec `--signature` : `"signature": "ok"` (clôture à la charte Ok après la pub du client).
- La charte est celle du client (`charte.json`), même si elle n'est pas à notre goût.
- Le client valide le script puis le storyboard (Ok lui transmet les planches `revue/storyboard-*.png`).
- Livraison : les MP4 de `sorties/` + `textes.md` (légendes proposées).
- Rien d'inventé : une promesse absente du cahier des charges ne va pas dans la vidéo.
