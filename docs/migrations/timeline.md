# Migration : `timeline`

> Statut : **à faire** (pas encore spécifié) — mis à jour le 2026-11-07

Les règles communes à toute la migration sont dans [CONVENTIONS.md](CONVENTIONS.md) et ne sont pas répétées ici. Cette fiche ne contient pour l'instant que les contraintes connues avant la spec.

## 1. Périmètre

À écrire. Ce qu'on sait déjà :

- `src/framework/modules/timeline` : le fil de notifications (écran, `notification-top-info`…), les définitions des types de notifications (`reducer/notif-definitions`, redux), les widgets `MYAPPS_WIDGET` (affichés par `timeline`).
- `src/framework/modules/timeline/index.tsx` est un `EntModule` d'une API intermédiaire obsolète : il ne compile pas avec l'actuelle et n'est pas chargé (voir [STATUS.md](STATUS.md)).

## 2. Existant

À écrire.

## 3. Comportements à conserver

À écrire.

## 4. Ancienneté de conception à corriger au passage

À écrire.

## 5. Cible

### 5.1 Contrainte : découpage `timeline` / `notifications` (2026-11-07)

**Ce qui touche aux notifications sort de `timeline`, dans le module `notifications` (`src/modules/notifications`), consommé par `timeline` et par `home`.**

Pourquoi : un autre développeur écrit un nouveau module `home`. `home` et `timeline` vont coexister, et **tous deux contiennent un fil de notifications**. Les notifications (données, définitions des types, affichage d'une notification, ouverture) ne peuvent donc pas appartenir à `timeline` : elles vont dans leur propre module, que les deux consomment.

Ce que `notifications` porte déjà :

- l'enregistrement du push (FCM) par session ;
- `useNotificationEntApp(type, eventType)` et `useNotificationEntAppDisplay(type, eventType)` (`src/modules/notifications/hooks.ts`) : l'app d'un type de notification et son affichage (surcharges ELEA / REPORT). Ils lisent encore les définitions des types dans le redux de l'ancien `timeline` (`ToDo(timeline-migration)`).

À décider pendant la spec (question d'architecture n° 1 de [STATUS.md](STATUS.md)) : où vont les définitions des types de notifications, le fil lui-même (données, chargement, composants de liste et d'élément), l'ouverture d'une notification (registre dans `notifications` ou clé de config des modules), et ce qui reste propre à `timeline` (son écran, ses widgets ?).

## 6. Plan par phases

À écrire.

## 7. Décisions

- **2026-11-07** — Les notifications sont extraites de `timeline` dans le module `notifications`, consommé par `timeline` et par le futur module `home`, qui ont tous deux un fil de notifications (§5.1).

## 8. Questions ouvertes

- Voir §5.1 et la question d'architecture n° 1 de [STATUS.md](STATUS.md).

## 9. Avancement

- 2026-11-07 : fiche créée avec la contrainte de découpage `timeline` / `notifications`.
