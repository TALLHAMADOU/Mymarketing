# Lire les sources

Paramètre `--docs` : un ou plusieurs chemins (fichiers ou dossiers), séparés par des virgules. Sans `--docs`, cherche toi-même :

| Mode | Où chercher |
|---|---|
| promo | Dans le projet courant : `README*.md`, `docs/`, `marketing/`, `business*`, `*plan*`, `*.pdf` ; puis le code (nom de l'app, écrans principaux, thème/couleurs, logo dans `assets/`, `public/`, `web/`) |
| client | Le dossier donné par Ok (cahier des charges + images). S'il n'y a rien : demande le cahier des charges, ne pars pas de suppositions |
| tech-post | Le sujet donné + les notes éventuelles d'Ok (`--docs`) ; vérifie les faits récents par une recherche web si le sujet bouge vite |

Méthode :
- PDF : outil Read par tranches de pages (`pages: "1-10"`, puis la suite). Regarde aussi les images (captures, couleurs, logo).
- Repère et note pour le script : la phrase de catégorie, les personas, la trame vidéo éventuelle, les couleurs, le logo, le ton,
  les interdits, les chiffres réels avec leur source, la checklist de publication.
- Si le document a une partie « guide marketing / communication » (personas, narratif, identité, checklist), c'est elle qui fait foi ;
  copie-en l'essentiel dans `guide.md` du projet vidéo pour ne pas relire le PDF à chaque vidéo.
- Documents confidentiels : ne copie dans la vidéo et les textes que ce qui est destiné au public (pas de marges, pas de stratégie interne,
  pas de projections financières, sauf demande explicite d'Ok).
