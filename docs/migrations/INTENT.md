# Migration vers le nouveau système de modules : intention

> Ce document se lit avant tout le reste du dossier, par les humains comme par l'agent. Il dit pourquoi on migre, ce qui est dans la migration, comment on la mène et quand elle est finie. L'état du moment est dans [SUIVI.md](SUIVI.md) (calculé) et [STATUS.md](STATUS.md) (décisions et contexte).

## 1. Le contexte

L'application mobile est une app React Native découpée en modules (blog, messagerie, vie scolaire, cahier de textes…), déclinée en plusieurs marques. Chaque module déclare ses écrans, son état et ses droits auprès d'un framework commun.

Deux générations de ce framework coexistent dans le code :

| | Ancienne génération | Nouvelle génération |
| --- | --- | --- |
| Déclaration d'un module | `NavigableModule` + `module-config.ts` | `EntModule` ou `CoreModule` dans `index.ts` |
| Navigation | dynamique : `createModuleNavigator`, `<Stack.Screen>` | statique : `defineScreen`, `defineModal`, `src/app/navigation-new/` |
| État | Redux enregistré par `Reducers.register` | Redux passé par `redux: { reducer }`, ou zustand |
| Chargement de session | `callAtLogin` | `sessionSetup`, `onSessionStart` |
| Registre | `AllModules()` | `src/app/config/modules.ts` |

Le détail technique est dans [ARCHITECTURE.md](../ARCHITECTURE.md).

## 2. Pourquoi on migre, et pourquoi d'un seul bloc

La montée de version de React Native (0.85 vers 0.88) et celle de react-navigation arrivent ensemble, et react-navigation apporte beaucoup de changements cassants. L'architecture des modules doit évoluer pour supporter les deux à la fois : l'ancienne navigation dynamique ne tient pas sur la nouvelle pile.

Conséquences :

- **la montée React Native ne peut pas être livrée seule** : `feat/rn86` attend la migration ;
- **`feat/navigation` est la branche de la migration**. Elle sera mergée dans `feat/rn86`, puis l'ensemble dans la branche de développement ;
- **sur `feat/navigation`, l'app ne charge plus les modules anciens** : un module pas encore migré est absent de l'app. La migration se livre donc d'un seul bloc, quand tous les modules sont passés.

Ce choix a un coût connu : tant que la migration n'est pas finie, rien n'est livré, et le code ancien continue d'évoluer sur les branches d'équipe. D'où les règles de ce document : avancer par petits pas vérifiés, mesurer ce qui reste, ne rien embarquer d'autre.

## 3. Le résultat attendu

- Tous les modules sont déclarés en `EntModule` ou `CoreModule` et chargés par `src/app/config/modules.ts`.
- L'ancienne navigation (`src/app/navigation/`), les façades de l'ancienne authentification et `media-deprecated` sont supprimées.
- L'app tourne sur React Native 0.88 et sur le nouveau système, sur toutes les marques.
- Pour les utilisateurs, rien ne change : mêmes écrans, mêmes parcours, mêmes données conservées sur l'appareil.

## 4. La migration d'un module se fait en deux étapes

| | Étape 1 : la bascule | Étape 2 : l'assainissement |
| --- | --- | --- |
| Ce qu'elle fait | le module change de génération ; son comportement et son code interne ne changent pas | zustand, hooks à la place de `connect(`, modèle, corrections, conversions d'interface |
| Qui | l'agent, à partir du patron ([BASCULE.md](BASCULE.md)) ; le développeur relit et joue le parcours | le développeur, quand il le décide |
| Preuve | compteurs du module à zéro, `tsc` identique fichier par fichier, flows Maestro verts avant et après | celle d'un changement ordinaire |
| Taille | petite et relisible | un sujet par PR |

Les deux étapes ne vont jamais dans le même commit ni dans la même PR. Une amélioration rencontrée pendant la bascule se note en une ligne dans la fiche du module : elle n'est pas perdue, elle vient après.

**La migration, au sens de ce document, c'est l'étape 1 de tous les modules.** L'étape 2 peut continuer après la livraison.

### Hors de la migration

Chacun de ces sujets a son propre ticket, après la bascule du module concerné :

- le passage à zustand, de `connect(` aux hooks, des classes aux fonctions ;
- la refonte d'un modèle ou d'un service, un changement d'API serveur ;
- les conversions d'interface (bottom sheet, modales), `moment` vers Temporal ;
- les corrections de bugs, le nettoyage des erreurs `tsc` ou ESLint déjà présentes ;
- React Navigation 8.

### Ce que les deux étapes ne règlent pas

- **Les dépendances entre modules anciens.** Un module basculé qui importe un module ancien compile, mais ce module ancien n'est pas chargé par l'app. La colonne « Modules anciens importés » de [SUIVI.md](SUIVI.md) les montre : elle donne l'ordre de migration (les modules dont les autres dépendent d'abord).
- **Ce qui n'a pas encore d'équivalent dans le nouveau système** : ouverture des notifications, widgets, intents, liste de modules par marque. Ce sont des décisions de conception, listées dans [STATUS.md](STATUS.md) et [later.md](later.md) ; aucune vitesse d'exécution ne les remplace.
- **Le test complet d'un module isolé.** Certaines parties d'un module ne peuvent être jouées dans l'app qu'une fois d'autres modules migrés. C'est le cas de `myapps` : le module a été testé dans l'app, mais l'ouverture d'une application portée par un module attend la migration de ce module.
- **Le temps humain.** Le coût d'un module est dans les décisions, la relecture et le test dans l'app, pas dans l'écriture.

## 5. Comment se comporter pendant la migration

Valable pour le développeur comme pour l'agent.

1. **Le test d'abord.** Les flows Maestro du module existent et passent sur l'ancienne génération avant qu'on touche au module ([.maestro/README.md](../../.maestro/README.md)).
2. **Un module, une PR.** Rien d'un autre module, rien du framework. Si la bascule demande une évolution du framework, elle part avant, à part.
3. **Porter, pas améliorer.** Tout ce que la bascule n'exige pas est noté dans la fiche et reporté à l'étape 2.
4. **S'arrêter et demander** quand le module dépend d'un module ancien, d'une notification, d'un widget ou d'une modale globale, ou quand plus de trois fichiers hors du module sont touchés.
5. **Ne jamais dire « ça passe » sans l'avoir lancé.** `tsc` se compare fichier par fichier, pas en nombre d'erreurs. « Pas testé dans l'app » s'écrit tant que c'est le cas.
6. **Une décision se prend une fois.** Elle s'écrit dans [CONVENTIONS.md](CONVENTIONS.md) ou dans la skill, et ne se repose plus au module suivant.
7. **Le compteur ne remonte pas.** Aucun nouveau code sur l'ancienne génération : `yarn migration-status --check` échoue si un compteur augmente.
8. **`testID` et clés de stockage ne changent pas.** Ce sont eux qui rendent le test avant / après possible, et les tests de l'équipe QA.

## 6. Mesurer : le suivi calculé

[SUIVI.md](SUIVI.md) est une page générée. Elle ne se modifie pas à la main.

```bash
yarn migration-status           # recalcule docs/migrations/SUIVI.md et suivi.json
yarn migration-status --check   # échoue si un compteur de l'ancienne génération a augmenté
```

Le script (`cli/migration-status.js`) lit `src/` et ne modifie rien dans le code. Pour chaque module, il compte :

| Colonne | Ce qui est compté | Sert à |
| --- | --- | --- |
| Statut | `à faire`, `non chargé`, `bascule incomplète`, `basculé, sans test`, `basculé, testable` | savoir où en est le module sans ouvrir son code |
| Écrans anciens | les `<Stack.Screen>` | estimer la taille de la bascule |
| Navigation ancienne | les fichiers avec `createModuleNavigator`, `~/app/navigation`, `NativeStackScreenProps`, `navigation.setOptions` | vérifier qu'une bascule est complète |
| `connect(` | les fichiers qui l'utilisent | préparer l'étape 2 |
| Modules anciens importés | les modules encore en `NavigableModule` importés par ce module | choisir l'ordre de migration |
| Notif. | la présence d'un `notif-handler` | repérer les modules bloqués par la question des notifications |
| Flows | les fichiers `.maestro/flows/<module>-*.yaml` | savoir si le module a un test dans l'app |

En tête de page, cinq totaux : modules restants, lignes dans les modules anciens, écrans anciens, fichiers sur l'ancienne navigation, fichiers avec `connect(`. Ce sont les chiffres qui doivent baisser.

**Quand la relancer** : à la fin de chaque session de migration, avec le journal. Le fichier se commite avec le module : l'historique git de `SUIVI.md` donne la courbe, et le nombre de modules basculés par semaine donne une date de fin.

**Répartition avec `STATUS.md`** : `SUIVI.md` dit ce que le code contient ; `STATUS.md` dit ce qu'on a décidé, ce qui bloque et la suite. Si les deux se contredisent, c'est `SUIVI.md` qui a raison sur les faits.

## 7. Terminé quand

**Un module** est basculé quand :

1. ses compteurs de l'ancienne génération sont à zéro dans [SUIVI.md](SUIVI.md) ;
2. il n'importe plus aucun module ancien ;
3. `tsc` ne montre aucune erreur nouvelle, comparé fichier par fichier ;
4. ses `testID` et ses clés de stockage sont inchangés ;
5. ses flows Maestro passent sur l'app comme ils passaient avant, ou sa fiche dit précisément ce qui ne peut pas encore être joué et pourquoi.

**La migration** est terminée quand tous les modules sont basculés, que `feat/navigation` est mergée dans `feat/rn86`, et que l'ensemble est en production.

## 8. Faire apprendre la skill

La skill `migrate-module` est l'endroit où l'on capitalise. Après chaque module, quinze minutes :

| On regarde | On en fait |
| --- | --- |
| les questions que l'agent a posées | une décision écrite, s'il la reposerait au module suivant |
| ce qui a cassé dans l'app alors que `tsc` passait | un critère de fin, ou un flow Maestro |
| ce que le développeur a corrigé à la main dans le diff | une règle ou un exemple dans la skill |
| le temps passé (lecture, décisions, écriture, test) | une ligne dans le journal : ce débit donne la date de fin |

## 9. Les fichiers du dossier

| Fichier | Rôle |
| --- | --- |
| [INTENT.md](INTENT.md) | ce document : le pourquoi, le périmètre, les règles |
| [SUIVI.md](SUIVI.md) | l'état calculé, module par module |
| [STATUS.md](STATUS.md) | décisions, blocages, prochaines étapes |
| [BASCULE.md](BASCULE.md) | le patron de l'étape 1 : les gestes, les conditions d'arrêt, la vérification |
| [\_template-bascule.md](_template-bascule.md) | le gabarit de l'intention d'un module ; exemple rempli : [support.md](support.md) |
| [CONVENTIONS.md](CONVENTIONS.md), [JOURNAL.md](JOURNAL.md), [later.md](later.md) | règles communes, journal des sessions, sujets reportés |
