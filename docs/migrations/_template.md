# Migration : `<module>`

> Statut : à faire · spec · en cours · fait · nettoyé — mis à jour le AAAA-MM-JJ

## 1. Périmètre

Ce que fait le module, ce qui est dans / hors du périmètre de la migration.

## 2. Existant

- Fichiers et responsabilités (ancien et nouveau).
- Consommateurs externes : qui importe quoi, et par quoi le remplacer.

## 3. Comportements à conserver

Liste vérifiable (données, règles métier, stockage, testIDs E2E, textes i18n).

## 4. Ancienneté de conception à corriger au passage

Défauts de conception de l'ancien code (bugs, mécanismes contournés, dette). Pour chacun : constat, correction proposée, statut (`réglé par la cible` · `à faire au portage` · `à valider` · `noté`). Par défaut on porte tel quel : ne corriger au passage que ce qui est local au module.

## 5. Cible

Architecture retenue : config du module, stores, service, API publique, navigation, stockage, façades `@deprecated`.

## 6. Plan par phases

Chaque phase compile, se teste et se valide seule.

## 7. Décisions

Décisions acquises, avec la raison en une ligne et la date.

## 8. Questions ouvertes

À trancher avec l'utilisateur. Une fois tranchée, une question passe en §7.

## 9. Avancement

Ce qui est fait, phase par phase ; marqueurs `ToDo(<module>-migration)` laissés dans le code.
