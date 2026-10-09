# Écrire la voix off et les textes d'écran

## Rythme
- Débit de la voix française : ~2,5 mots/seconde. **60 s ≈ 140–150 mots de voix. 30 s ≈ 70 mots.** `mm valider` estime la durée.
- Une scène = une idée = 3 à 10 secondes. 6 à 9 scènes pour 60 s, 4 à 5 pour 30 s.
- Un segment de voix (`|`) = une phrase courte (5–15 mots) = un élément qui apparaît à l'écran.

## Structure qui retient l'attention
1. **Accroche (0–3 s)** : une question ou une tension que le public reconnaît. Jamais « Bonjour, aujourd'hui je vais… ».
2. **Promesse** : ce qu'on va comprendre / gagner.
3. **Corps** : la démonstration, une idée par scène.
4. **Chute** : la réponse claire (quand choisir quoi, le résultat obtenu).
5. **Appel à l'action** : une seule action (commenter, s'abonner, demander une démo sur WhatsApp).

## Voix off
- Phrases parlées, simples, au présent. Tutoiement pour les tech-posts de Ok ; vouvoiement pour une cible de décideurs (sauf guide contraire).
- Pas de parenthèses, pas d'abréviations, pas de listes à puces dans la voix.
- Écris les nombres comme ils se disent si la voix bute : « deux cent cinquante mille francs CFA ».
- Sigles : la charte `ok` contient déjà la prononciation des sigles courants (API, REST, GraphQL, JSON, HTTP…).
  Ajoute les noms propres du projet dans `projet.json > prononciation` (ex. `"WaxPay": "Wax Pay"`).
- Relis chaque segment à voix haute (mentalement) : s'il est dur à dire, il est dur à écouter.

## Textes d'écran
- **L'écran montre, la voix explique.** Titre ≤ 8 mots, item de liste ≤ 6 mots, détail ≤ 10 mots.
- Un seul mot ou groupe mis en avant (`*…*`) par texte.
- Typographie française : espace avant `? ! : ;` (gérée automatiquement), guillemets « ».
- Sous-titres automatiques (générés depuis la voix) : ne les répète pas dans les textes d'écran.

## Vérité
- Tout fait technique doit être exact et nuancé (« souvent », « en général » quand c'est le cas). En cas de doute, vérifie (recherche web) ou retire.
- Aucun chiffre, prix, témoignage ou résultat inventé. Les chiffres viennent des documents fournis (champ `source`).
- Pour un produit : uniquement des fonctionnalités qui existent (documents, code, captures).

## Persona
- Choisis UN persona (donné par `--cible`, sinon déduis-le du guide et dis lequel tu as choisi).
- Écris avec ses mots à lui, sa douleur à lui, le résultat qu'il veut, l'objection qu'il a.
