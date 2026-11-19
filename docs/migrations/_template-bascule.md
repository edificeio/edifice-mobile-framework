# Bascule : `<module>`

> Statut : à faire · tests écrits · basculé · joué dans l'app — mis à jour le AAAA-MM-JJ
>
> Intention de la bascule de ce module (étape 1). Le pourquoi de la migration, les règles et la définition de « terminé » sont dans [INTENT.md](INTENT.md) et ne se répètent pas ici ; le patron est dans [BASCULE.md](BASCULE.md). Une page : ce qui est propre à ce module.

## 1. Ce que fait le module

Deux ou trois phrases, du point de vue de l'utilisateur. Par où on y entre (onglet, « Mes applis », notification, autre module).

## 2. Taille et dépendances

Repris de [SUIVI.md](SUIVI.md) à la date du statut.

| Fichiers | Lignes | Écrans | Modales | `connect(` | Notifications |
| ---: | ---: | ---: | ---: | ---: | :---: |
| | | | | | |

- **Modules anciens importés** : lesquels, pour quoi faire. Chacun est une condition d'arrêt : le migrer d'abord, ou écrire ici pourquoi on continue.
- **Consommateurs** : qui importe ce module, et ce qu'il faut rebrancher.

## 3. Comportements à conserver

Cinq à huit, vérifiables, un flow Maestro chacun.

| # | Comportement | Flow | Passe sur l'ancienne | Passe après |
| --- | --- | --- | :---: | :---: |
| 1 | | `<module>-01-….yaml` | | |

`testID` ajoutés pour les tests (sur l'ancienne génération, avant la bascule) : …

## 4. Dans la bascule

Ce que les six gestes de [BASCULE.md](BASCULE.md) donnent pour ce module : écrans et modales à déclarer, reducer, chargement de session, points d'entrée (`entries`), droits.

## 5. Hors de la bascule

Ce qu'on a vu et qu'on ne touche pas. Une ligne par sujet : c'est le backlog de l'étape 2.

## 6. Décisions

Propres à ce module, avec la raison en une ligne et la date. Une décision qui vaut pour tous les modules va dans [CONVENTIONS.md](CONVENTIONS.md).

## 7. Vérification

| Contrôle | Avant | Après |
| --- | --- | --- |
| `tsc` dans le dossier du module (comparé fichier par fichier) | | |
| ESLint sur le dossier | | |
| Compteurs de [SUIVI.md](SUIVI.md) | | |
| Flows Maestro | | |
| Parcours joué dans l'app (iOS, Android) | | |

Ce qui ne peut pas encore être joué dans l'app, et le module qu'il attend : …

## 8. Mesure

Temps passé : lecture, décisions, écriture, test. Questions posées par l'agent. Ce que la skill doit apprendre de ce module.
