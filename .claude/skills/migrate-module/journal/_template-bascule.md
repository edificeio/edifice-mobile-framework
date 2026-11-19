# Bascule : `<module>`

> Statut : à faire · tests écrits · basculé · joué dans l'app — mis à jour le AAAA-MM-JJ
>
> Fiche du module : sa bascule (étape 1), puis son assainissement (étape 2, §9). Le pourquoi de la migration, les règles et la définition de « terminé » sont dans [INTENT.md](../INTENT.md) et ne se répètent pas ici ; le patron est dans [BASCULE.md](../BASCULE.md). Une page : ce qui est propre à ce module.

## 1. Ce que fait le module

Deux ou trois phrases, du point de vue de l'utilisateur. Par où on y entre (onglet, « Mes applis », notification, autre module).

## 2. Taille et dépendances

Repris de [SUIVI.md](SUIVI.md) à la date du statut.

| Fichiers | Lignes | Écrans | Modales | `connect(` | Notifications |
| ---: | ---: | ---: | ---: | ---: | :---: |
| | | | | | |

- **Modules anciens importés** : lesquels, pour quoi faire. Pour chacun : **code seul** (service, utilitaire, constantes, types : permis, avec `ToDo(<module>-migration)`) ou **navigation / state** (condition d'arrêt : le migrer d'abord).
- **Importeurs** : quels modules importent ce module, et quoi. Ceux qui importent `module-config.ts` ou `navigation/` gardent une façade (geste 15).

## 3. Comportements à conserver

Cinq à huit, vérifiables. Un flow Maestro chacun quand c'est possible (recommandé, pas bloquant) ; sinon la recette manuelle en une ligne.

| # | Comportement | Flow ou recette | Passe sur l'ancienne | Passe après |
| --- | --- | --- | :---: | :---: |
| 1 | | `<module>-01-….yaml` | | |

`testID` ajoutés pour les tests : …

## 4. Dans la bascule

Ce que les gestes de [BASCULE.md](../BASCULE.md) donnent pour ce module :

- écrans et modales à déclarer ; **routes** : ancienne → nouvelle (suffixe de la route d'accueil choisi par le développeur), noms de télémétrie qui changent ;
- en-têtes (options, `setOptions`, `~/framework/navigation/*`), `useConfirmRemove`, écrans en classe, `withSession` pour les écrans qui lisent la session ;
- reducer, chargement de session (`sessionSetup` / `onSessionStart`), `storages` ;
- points d'entrée (`entries`), droits (`matchEntcoreApp`, `hasRight(session)`) ;
- façades laissées pour les importeurs.

## 5. Hors de la bascule

Ce qu'on a vu et qu'on ne touche pas.

### Backlog

Une ligne par point, avec le sujet de `/sanitize-module` qui le traitera (`connect`, `styles`, `dette`…) : c'est la source de §9.

### Noté, non traité

Ce qui ne relève pas du module (composant du framework, chantier transverse) ou qu'on a décidé de laisser, avec la raison.

## 6. Décisions

Propres à ce module, avec la raison en une ligne et la date. Une décision qui vaut pour tous les modules va dans [CONVENTIONS.md](../CONVENTIONS.md).

### Questions ouvertes

Numérotées, avec options et recommandation.

## 7. Vérification

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` dans le dossier du module (comparé fichier par fichier) | | |
| ESLint sur le dossier | | |
| Compteurs de [SUIVI.md](SUIVI.md) | | |
| Flows Maestro ou recette manuelle | | |
| Parcours joué dans l'app (iOS, Android) | | |

Ce qui ne peut pas encore être joué dans l'app, et le module qu'il attend : …

## 8. Mesure

Temps passé : lecture, décisions, écriture, test. Questions posées par l'agent. Ce que les skills doivent apprendre de ce module.

## 9. Assainissement

Tenu par `/sanitize-module`, un sujet par PR (un sujet absorbé va dans la PR de celui qui l'absorbe). Sujets tirés de §5.

| Sujet | Statut | Décisions | Recette à jouer dans l'app | PR / commit |
| --- | --- | --- | --- | --- |
| | à faire · en cours · fait · absorbé par `<sujet>` · sans objet · abandonné | | | |
