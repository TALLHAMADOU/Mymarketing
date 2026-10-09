# Contrôle qualité

## Avant de montrer le storyboard (à faire toi-même)
- [ ] `mm verifier` : 0 erreur. Avertissements de contraste corrigés (`accent_texte` plus foncé dans la charte).
- [ ] Chaque planche regardée : aucun texte coupé, tronqué, qui se chevauche ou sort du cadre ; aucune scène vide ou à moitié remplie.
- [ ] Orthographe et accents de chaque texte d'écran ; typographie française.
- [ ] Les deux formats (4:5 et 9:16) sont lisibles ; en 9:16 rien d'important dans le bas de l'écran.
- [ ] Durée (`mm voix`) proche de la cible (± 15 %).
- [ ] Le code affiché est juste ; les faits techniques sont exacts.

## Règles de contenu (toujours)
- [ ] Un seul persona visé, une seule action demandée.
- [ ] Le message part d'une douleur ou d'une question réelle, pas d'une liste de fonctionnalités.
- [ ] Aucun chiffre, prix, témoignage ou résultat inventé ; chaque chiffre a sa source.
- [ ] Prix exactement comme dans le guide, avec ses mentions obligatoires.
- [ ] Captures réelles et à jour si le guide l'exige ; données de démonstration uniquement.
- [ ] Couleurs et logo conformes à la charte ; aucune couleur ajoutée.
- [ ] La checklist propre au guide du produit / du client est passée ligne par ligne.

## Après le rendu
- [ ] `sorties/rendu.json` : durée attendue, audio ≈ -14 LUFS, crête ≤ -1 dBTP.
- [ ] 3–4 images extraites de chaque MP4 (`ffmpeg -ss <t> -i <mp4> -frames:v 1 …`) et regardées.
- [ ] `sorties/textes.md` écrit.
