# Bascule : `support`

> Statut : **basculé, pas joué dans l'app** — mis à jour le 2026-11-19
>
> Premier module passé par la bascule seule (étape 1 d'[INTENT.md](INTENT.md)), pour éprouver le patron [BASCULE.md](BASCULE.md). Fait par un agent sans développeur pour répondre : chaque décision ci-dessous est un choix par défaut à valider.

## 1. Ce que fait le module

Un écran : créer un ticket d'assistance (catégorie, établissement, sujet, description, pièces jointes). On y entre par « Mes applis », app ENT « Aide et support ». La création demande le droit `TicketController|createTicket`.

## 2. Taille et dépendances

| Fichiers | Lignes | Écrans | Modales | `connect(` | Notifications |
| ---: | ---: | ---: | ---: | ---: | :---: |
| 9 | 479 | 1 | 0 | 1 | non |

- **Module ancien importé : `workspace`.** `actions/index.ts` appelle `workspaceFileTransferActions.uploadFilesAction` pour envoyer les pièces jointes, et `reducer.ts` importe `workspace/module-config`. `workspace` n'est pas migré, donc pas chargé par l'app : le code compile, **le comportement de l'envoi de pièces jointes est inconnu**. C'est une condition d'arrêt du patron ; elle est laissée ouverte ici pour être tranchée (question 1).
- **Consommateurs** : aucun import depuis un autre module. Seule mention : le littéral `'support'` dans un type de `src/app/intents.ts`, non touché.

## 3. Comportements à conserver

Aucun flow Maestro n'existe encore pour ce module : ils sont à écrire sur l'ancienne génération (voir [.maestro/README.md](../../.maestro/README.md)). Le module n'a aucun `testID` : il faut en ajouter.

| # | Comportement | Flow | Passe sur l'ancienne | Passe après |
| --- | --- | --- | :---: | :---: |
| 1 | « Aide et support » s'ouvre dans l'app depuis « Mes applis », avec son titre et un bouton retour | à écrire | — | — |
| 2 | La liste des catégories est remplie ; le second sélecteur n'apparaît que sur un compte multi-établissements | à écrire | — | — |
| 3 | Sujet saisi puis retour : alerte de confirmation ; « continuer » reste, « quitter » sort | à écrire | — | — |
| 4 | Ajout d'une pièce jointe par chaque source, puis retrait | à écrire | — | — |
| 5 | Envoi avec sujet et description : retour à l'écran précédent, toast de succès avec le numéro du ticket | à écrire | — | — |
| 6 | Compte sans droit de création : écran vide ; compte sans l'app : entrée absente de « Mes applis » | à écrire | — | — |

## 4. Dans la bascule

- `module-config.ts` et `navigation/` supprimés ; `index.ts` exporte un `EntModule` (`scope`, `matchEntcoreApp`, `entTrackingName`, `fileManager`, `redux: { reducer }`).
- Un écran, `support`, en `defineScreen` ; `navBarOptions` remplacé par `options: () => ({ title })`.
- Point d'entrée : `entries.myApps`, sans lequel le module n'est pas ouvrable.
- Session et types pris dans `~/modules/auth` (`getSession`, `assertSession`, `AuthActiveAccount`) au lieu des façades.
- Une ligne dans `src/app/config/modules.ts`.
- Le module reste **sur place**, dans `src/framework/modules/support` (ARCHITECTURE §2).

Diff : 11 fichiers, +47 / −79. `reducer.ts` et `styles.ts` ne sont pas modifiés.

## 5. Hors de la bascule

Vu et non touché :

- `connect(` + `tryActionLegacy` vers des hooks ; `sessionFetch` vers `getModuleTransport('support')` ;
- le type d'action `WORKSPACE_POST_TICKET` (préfixe d'un autre module) et le reducer `ticket`, que personne ne lit ;
- les 5 erreurs `tsc` du module (`export type`, double chemin d'import de `LocalFile`), les 3 `no-unused-vars`, les 3 styles en ligne ;
- `usePreventBack` (déprécié) vers `useConfirmRemove` ;
- `rights.ts` vers `hasRight` de la configuration du module ;
- la structure cible `model/`, `store/`, `service/api.ts` ;
- le titre et le texte identiques dans l'alerte de sortie.

## 6. Décisions

Prises par défaut le 2026-11-18, à valider :

| Sujet | Choix | Raison |
| --- | --- | --- |
| Nom de route | `support`, l'ancien `routeName` | ne pas changer la télémétrie ; la convention voudrait `support/<suffixe>` |
| Gestionnaire d'état | Redux gardé | étape 2 |
| `connect(` | gardé | étape 2 |
| `storageName: 'support'` | disparaît avec `module-config.ts` | n'était lu par aucun code |
| Nom du module dans l'écran | littéral `'support'` à la place de `moduleConfig.name` | `module-config.ts` n'existe plus |

### Questions ouvertes

1. **Envoi des pièces jointes par l'ancien `workspace`** : migrer `workspace` d'abord, extraire l'envoi de fichiers dans le framework, ou accepter l'import en attendant ? `workspace` est aussi importé par `blog`, `homework`, `mails` et `user` ([SUIVI.md](SUIVI.md)).
2. Le nom de route : `support` ou `support/create-ticket` ?
3. L'équivalence `entTrackingName` / `entcoreTrackingName` pour la télémétrie.

## 7. Vérification

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` dans le dossier du module | 5 erreurs | les 5 mêmes |
| `tsc`, total du dépôt (2026-11-18, commit `e16838317`) | 777 | 777, identiques fichier par fichier |
| ESLint sur le dossier | 6 erreurs, 3 avertissements | 3 erreurs, 3 avertissements, aucune nouvelle |
| Jest | 431 | 431 ; aucun test ne couvre ce module |
| Flows Maestro | aucun | aucun |
| Parcours joué dans l'app | — | **non** |

Mesures du 2026-11-18, prises quand le module avait été déplacé dans `src/modules/support`. Il a été remis sur place le 2026-11-19 (chemins d'import seulement) ; remesuré sur le commit `2b57860e1` : les 5 mêmes erreurs `tsc` dans le module, ESLint 3 erreurs et 3 avertissements. Le total `tsc` du dépôt y est de 781, sans mesure d'avant sur ce commit.

Recette à jouer dans l'app tant que les flows n'existent pas : les six comportements du §3, plus l'envoi hors réseau (toast d'erreur, bouton de nouveau actif, saisie conservée) et le changement de compte (aucun état ne persiste).

## 8. Mesure

- Écriture de la bascule : environ 4 minutes. Lecture et plan : environ 10 minutes. Mesures `tsc`, ESLint, Jest avant et après : environ 6 minutes.
- **Douze décisions rencontrées pour 500 lignes**, toutes prises seul en « tel quel ». Avec un développeur, le temps réel est celui des réponses et de la relecture.
- Ce module est le cas le plus simple : un écran, ni notification, ni modale, ni consommateur. **Ne pas en déduire une durée par module.**
- Ce que la skill doit en apprendre : le critère « zéro import d'un module ancien » manquait ; `tsc` doit se comparer fichier par fichier (777 avant, 777 après ne prouve rien en nombre) ; un module sans `testID` ne peut pas être testé avant sa bascule.
