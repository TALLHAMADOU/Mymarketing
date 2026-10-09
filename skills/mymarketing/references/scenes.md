# Catalogue des scènes

Chaque scène est un objet de `projet.json > scenes`. Champs communs :

- `type` (obligatoire), `voix` (texte lu ; segments séparés par `|`), `duree` (secondes, minimum ; utile sans voix),
  `attaque` (silence avant la voix, défaut 0,3 s), `queue` (temps après la voix, défaut 0,55 s).
- Dans les textes d'écran, `*mot*` ou `*plusieurs mots*` = mis en avant (couleur d'accent).

**Synchronisation** : chaque segment de voix (`|`) est un « temps fort ». Le 1er élément de la scène apparaît sur le 1er segment,
le 2e sur le 2e, etc. Si la scène a un `titre` **et** un segment de plus que d'éléments, le 1er segment est pour le titre.
Exemple : liste de 3 items avec titre → 4 segments (titre lu, puis un par item). Sans segment dédié, le titre apparaît d'entrée.

---

### accroche — phrase choc d'ouverture
```json
{ "type": "accroche", "lignes": ["REST ou *GraphQL* ?", "Le bon choix dépend de ton projet."],
  "voix": "REST ou GraphQL ?|Le bon choix dépend de ton projet." }
```
Une ligne par segment. 2 lignes max, 6–8 mots par ligne. Option `sous_texte`.

### titre — sujet de la vidéo
```json
{ "type": "titre", "surtitre": "En 60 secondes", "titre": "C'est quoi *Docker* ?", "logos": ["si:docker"],
  "sous_titre": "Le conteneur expliqué simplement", "voix": "C'est quoi Docker ?|Le conteneur, expliqué simplement." }
```
`logos` : `si:<nom>` (Simple Icons : graphql, docker, go, flutter, nextdotjs, postgresql, react…), un chemin d'image, ou un texte court (monogramme).

### versus — duel A contre B
```json
{ "type": "versus", "titre": "Le duel",
  "gauche": { "nom": "REST", "logo": "REST", "sous_titre": "Une URL par ressource" },
  "droite": { "nom": "GraphQL", "logo": "si:graphql", "sous_titre": "Un seul point d'entrée" },
  "voix": "REST : une adresse par ressource.|GraphQL : un seul point d'entrée." }
```

### tableau — comparatif critère par critère (2 colonnes)
```json
{ "type": "tableau", "titre": "Critère par critère", "colonnes": ["REST", { "nom": "GraphQL", "logo": "si:graphql" }],
  "lignes": [
    { "critere": "Cache HTTP", "a": "Natif", "b": "À gérer", "gagnant": "a" },
    { "critere": "Données sur mesure", "a": "✗", "b": "✓", "gagnant": "b" }
  ],
  "voix": "Critère par critère.|Le cache HTTP : natif avec REST.|Les données sur mesure : avantage GraphQL." }
```
4 lignes max conseillé (5–6 possible). `✓`/`✗` (ou oui/non) deviennent des pastilles. `gagnant` : `a`, `b` ou absent.

### pour_contre — avantages / inconvénients
```json
{ "type": "pour_contre", "titre": "*Firebase* : le bilan", "pour": ["Démarrage rapide", "Temps réel inclus"],
  "contre": ["Coût imprévisible", "Dépendance à Google"],
  "voix": "Démarrage rapide.|Le temps réel est inclus.|Mais le coût peut grimper vite.|Et tu dépends de Google." }
```
Ordre d'apparition : tous les `pour`, puis tous les `contre` (un segment chacun). 3 + 3 max.

### liste — top N / points clés
```json
{ "type": "liste", "titre": "Top 3 des *outils*", "items": [
    { "titre": "Bruno", "detail": "Client d'API hors ligne" }, "Hoppscotch", "Insomnia" ],
  "voix": "Mon top 3.|Bruno, un client d'API qui marche hors ligne.|Hoppscotch.|Insomnia." }
```
`numerotee: false` → coches au lieu des numéros. 5 items max (6 en 9:16).

### etapes — processus relié
```json
{ "type": "etapes", "titre": "Déployer en *3 étapes*", "etapes": ["Construire l'image", "Pousser sur le registre", "Lancer le conteneur"],
  "voix": "Trois étapes.|On construit l'image.|On la pousse sur le registre.|Et on lance le conteneur." }
```

### code — extrait de code (1 ou 2 blocs, effet de frappe)
```json
{ "type": "code", "titre": "Un profil *et* ses articles",
  "blocs": [ { "libelle": "REST · 2 requêtes", "code": "GET /users/42\nGET /users/42/posts" },
             { "libelle": "GraphQL · 1 requête", "code": "query {\n  user(id: 42) { name }\n}" } ],
  "voix": "REST fait deux appels.|GraphQL, un seul." }
```
Lignes ≤ 34 caractères, 8 lignes max par bloc. Le code doit être **juste** (il sera lu par des développeurs).

### chiffre — un chiffre réel
```json
{ "type": "chiffre", "valeur": "800", "unite": "élèves", "legende": "suivis dans l'école de démonstration",
  "source": "Guide marketing du produit, §5", "voix": "Huit cents élèves suivis.|Dans une vraie école de démonstration." }
```
`source` obligatoire en pratique (avertissement sinon). **Jamais de chiffre inventé.**

### capture — vraie capture d'écran animée
```json
{ "type": "capture", "titre": "La caisse, *tracée*", "image": "sources/caisse.png", "cadre": "navigateur", "url": "app.exemple.com",
  "zoom": [0.05, 0.10, 0.45, 0.30], "clic": [0.25, 0.22], "legende": "Chaque paiement a sa quittance",
  "voix": "Voici la caisse.|Chaque paiement est tracé.|Un clic, et la quittance s'imprime." }
```
- `cadre` : `navigateur` (barre d'adresse), `telephone` (cadre de smartphone), `aucun`.
- `zoom` : `[x, y, largeur, hauteur]` en **fractions de l'image** (0–1) : la caméra zoome sur cette zone (encadrée).
- `clic` : `[x, y]` en fractions ; **doit être dans la zone de zoom** s'il y en a une. Un curseur vient cliquer.
- Ordre : la capture arrive, puis le zoom (1er segment), puis le clic (2e), puis la légende.
- `mm verifier` signale `escaped_container` / `container_overflow` pendant un zoom : c'est normal (l'image agrandie dépasse son cadre).

### video — l'app filmée (écran réel)
```json
{ "type": "video", "video": "sources/demo.mp4", "cadre": "telephone", "legende": "Encaisser en *10 secondes*",
  "debut_source": 2.5, "voix": "Le caissier encaisse depuis son téléphone.|Le reçu part tout de suite." }
```
La vidéo joue (sans son) pendant toute la scène, à partir de `debut_source`. Filme un peu plus long que la voix.

### avant_apres — la transformation
```json
{ "type": "avant_apres", "avant": { "titre": "Avant", "items": ["Caisse au cahier", "Reçus perdus"] },
  "apres": { "titre": "Avec le logiciel", "items": ["Quittance imprimée", "Impayés visibles"] },
  "voix": "Avant : la caisse au cahier.|Des reçus qui se perdent.|Après : la quittance s'imprime.|Et les impayés sautent aux yeux." }
```

### citation — témoignage réel (avec accord écrit)
```json
{ "type": "citation", "texte": "Plus aucun litige sur les rangs depuis la rentrée.", "auteur": "Prénom N.", "role": "Directeur, Ouagadougou",
  "voix": "Plus aucun litige sur les rangs depuis la rentrée." }
```

### texte — paragraphe simple
```json
{ "type": "texte", "titre": "Le principe", "texte": "Chaque école a sa propre base de données.", "voix": "…" }
```

### appel — appel à l'action
```json
{ "type": "appel", "titre": "Et toi, tu utilises *lequel* ?", "action": "Dis-le en commentaire",
  "contact": "WhatsApp : …", "voix": "Et toi, tu utilises lequel ?|Dis-le-moi en commentaire." }
```
Le bouton apparaît sur le 2e segment.

### signature — clôture signée
Ajoutée automatiquement à la fin si la charte a `signature.active` (ou `"signature": true` dans le projet). Pas de voix.
Contenu : logo (ou monogramme), `signature.ligne`, `signature.appel`, `signature.contact` de la charte.
