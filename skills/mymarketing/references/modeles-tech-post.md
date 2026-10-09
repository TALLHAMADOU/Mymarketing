# Les 4 modèles de tech-post (charte `ok`, signature Ok)

Durée par défaut 60 s (`duree_cible: 60`). Version courte 30 s : garde accroche + 2 scènes du corps + appel.
Les scènes entre crochets sont optionnelles.

## 1. Comparaison A vs B (ex. REST vs GraphQL, Flutter vs React Native, PostgreSQL vs MongoDB)
| # | Scène | Rôle |
|---|---|---|
| 1 | `accroche` | La question que tout le monde se pose (« A ou B ? ») + « ça dépend de ton projet » |
| 2 | `versus` | Le principe de chacun en une phrase |
| 3 | `code` ou `etapes` | La différence concrète, montrée (même tâche faite des deux façons) |
| 4 | `tableau` | 3–4 critères, un gagnant par ligne (honnête : chacun gagne quelque part) |
| 5 | `liste` (numerotee:false) | « Lequel choisir ? » : A pour…, B pour… |
| 6 | `appel` | « Et toi, tu utilises lequel ? » → commentaire |
Exemple complet : `exemples/rest-vs-graphql/projet.json`.

## 2. Avantages / inconvénients (ex. Firebase, Docker, Next.js, Supabase)
| # | Scène | Rôle |
|---|---|---|
| 1 | `accroche` | « X : bonne idée ou piège ? » |
| 2 | `titre` | Ce qu'est X en une phrase, avec son logo |
| 3 | `pour_contre` | 3 avantages, 3 inconvénients |
| 4 | [`chiffre`] | Un chiffre réel et sourcé (prix, limite gratuite…) |
| 5 | `liste` (numerotee:false) | Pour qui c'est fait / pour qui ce n'est pas fait |
| 6 | `appel` | Question ouverte |

## 3. « X en 60 secondes » (ex. C'est quoi une API ? Docker ? un VPS ?)
| # | Scène | Rôle |
|---|---|---|
| 1 | `accroche` | La confusion courante (« Tout le monde en parle, personne ne l'explique simplement ») |
| 2 | `titre` | « C'est quoi X ? » + logo |
| 3 | `texte` ou `avant_apres` | L'analogie de la vie réelle (le serveur de restaurant pour une API…) |
| 4 | `etapes` | Comment ça marche, en 3 étapes |
| 5 | [`code`] | Le plus petit exemple réel |
| 6 | `liste` | Quand l'utiliser (2–3 cas) |
| 7 | `appel` | « Quel sujet pour la prochaine ? » |

## 4. Top 5 (ex. 5 outils pour tester une API, 5 extensions VS Code)
| # | Scène | Rôle |
|---|---|---|
| 1 | `accroche` | Le problème que ces outils règlent |
| 2 | `liste` | Les 5, avec un détail d'utilité chacun (segment de voix par item) |
| 3 | [`versus` ou `tableau`] | Mon préféré face au plus connu, pourquoi |
| 4 | `appel` | « Lequel j'ai oublié ? » |
Avec 5 items détaillés, préfère 2 scènes `liste` (3 + 2) pour rester lisible en 4:5.

## Choisir le modèle
- Le sujet oppose deux choses → modèle 1. Un seul outil jugé → 2. Une notion à expliquer → 3. Une sélection → 4.
- Si les notes de Ok imposent un angle, il prime sur le modèle.
