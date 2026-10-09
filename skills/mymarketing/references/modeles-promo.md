# Trames promo produit (`/promo-video`) et pub client (`/client-ad`)

Si le guide du produit / le cahier des charges contient sa propre trame de script vidéo, **elle prime**.
Sinon, utilise ces trames, construites sur l'arc douleur → désir → preuve → offre.

## Promo 60 s (6–8 scènes)
| Temps | Séquence | Scènes conseillées | Contenu |
|---|---|---|---|
| 0–8 s | Leur monde | `accroche` (+ `texte`) | Une scène que le persona reconnaît : sa douleur quotidienne, avec ses mots |
| 8–16 s | Le coût de rester ainsi | `avant_apres` (partie avant) ou `liste` | Ce que ça coûte (temps, argent, réputation), sans exagérer |
| 16–24 s | Le futur désiré | `texte` ou `avant_apres` (après) | La journée calme / le résultat voulu |
| 24–44 s | Le pont : le produit | 2–3 `capture` / `video` | Captures **réelles**, zoom sur la zone qui prouve le résultat, curseur qui clique |
| 44–52 s | La preuve | `chiffre` ou `citation` | Un chiffre réel sourcé ou un témoignage autorisé |
| 52–60 s | L'offre + action | `appel` (+ signature) | Prix seulement s'il est dans le guide, une seule action, contact |

## Promo / pub 30 s (4–5 scènes)
`accroche` (douleur) → `capture`/`video` (le produit qui la règle) → [`chiffre` ou `avant_apres` court] → `appel`.

## Règles
- Le message part de la **douleur**, jamais de la liste des fonctionnalités (« 12 modules » est interdit sauf demande).
- 2–3 captures maximum dans une promo de 60 s, choisies pour le persona (ex. directeur → tableau de pilotage ; comptable → quittance).
- Le prix : uniquement s'il est écrit dans le guide, exactement comme écrit, avec les mentions obligatoires (ex. « formation incluse »).
- Couleurs : celles du guide seulement (`charte.json`), aucune couleur ajoutée « pour faire joli ».
- Logo : celui fourni, jamais déformé. Logo absent → monogramme à partir du nom (et signale-le).

## Charte d'un produit ou d'un client (`charte.json`)
```json
{ "nom": "MonProduit",
  "couleurs": { "accent": "#1F8A4C", "accent_texte": "#17703C", "encre": "#0B0B0B", "surface": "#F3F6F4" },
  "logo": "sources/logo.png",
  "signature": { "active": true, "ligne": "Notes, caisse et *parents*.", "appel": "Demandez une démo", "contact": "WhatsApp : …" },
  "marque": { "active": true, "libelle": "MonProduit" },
  "prononciation": { "MonProduit": "Mon Produit" } }
```
- `accent` : la couleur principale de la marque. `accent_texte` : une version plus foncée si l'accent est trop clair pour du texte sur fond blanc
  (le contrôle de contraste de `mm verifier` le signale).
- Où trouver les couleurs : guide de marque → code du projet (thème Flutter `ThemeData`/`ColorScheme`, `tailwind.config`, variables CSS) → logo.
- Logo : cherche dans le projet (`assets/`, `public/`, `web/icons/`), préfère un PNG/SVG sur fond transparent ; copie-le dans `sources/`.
