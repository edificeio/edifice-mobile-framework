# Modules de référence

Modules migrés **relus en détail par un développeur**, à imiter pendant une migration. Seuls ceux de ce tableau servent de modèle : un module migré qui n'y figure pas n'a pas encore été validé, il ne sert pas d'exemple.

| Module   | Emplacement          | Type         | Terminé le | À imiter pour                                                                                                                                                                                                                                                                                                                                                                                                                                 | Fiche                                           |
| -------- | -------------------- | ------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `myapps` | `src/modules/myapps` | `EntModule`  | 2026-11-10 | **Le modèle par défaut d'un module fonctionnel.** Structure (`model/` par objectif, `actions.ts`, `service/` avec `api.ts` + `adapter.ts`, `store/` Redux `createSessionReducer`, `storage.ts`, `session.ts`), API publique `hooks/`, écran avec header par options (`screens/home/`), sheets `formSheet` (`screens/menu.tsx`, `screens/app-actions.tsx`, `screens/sheet.tsx`), `useConfirmRemove` (`screens/favorites/`), tests colocalisés. | [myapps.md](../../../docs/migrations/myapps.md) |
| `auth`   | `src/modules/auth`   | `CoreModule` | 2026-10-27 | Module **réécrit** : stores zustand indépendants, `flows/` et injection par provider (`AuthFlowsProvider`), cycle de session, façades `@deprecated` aux anciens chemins (`src/framework/modules/auth`), API publique en trois dossiers (`hooks/`, `hoc/`, `components/`), gabarits réutilisables (`templates/`).                                                                                                                              | [auth.md](../../../docs/migrations/auth.md)     |

Remarques :

- Les deux modèles sont dans `src/modules/` (modules réécrits). Un module fonctionnel migré **sur place** dans `src/framework/modules/` garde son emplacement : imiter la structure de `myapps` à l'intérieur du dossier existant, sans déplacer ce qui n'a pas besoin de l'être.
- `auth` est un cas à part (module technique central) : l'imiter pour les façades et l'API publique, pas pour zustand ni les flows, sauf décision.
- `communities` (cité par `CLAUDE.md` §5) est de l'ancienne génération : il ne sert pas de modèle de migration.

## Ajouter un module

À faire **seulement à la demande du développeur**, après sa relecture complète du module migré (pas à la fin d'une session de migration par défaut).

1. Vérifier que la fiche du module est au statut `fait` ou `nettoyé` et que §8 n'a plus de question bloquante.
2. Demander au développeur ce que le module illustre de mieux que les modèles existants (ex. un module migré sur place, des notifications, des widgets).
3. Ajouter une ligne au tableau (date de fin de migration, à imiter pour, lien vers la fiche). Garder `myapps` en tête tant que le développeur ne désigne pas un autre modèle par défaut.
4. Si le nouveau module contredit un modèle existant (structure, nommage), le signaler : soit une règle de `docs/migrations/CONVENTIONS.md` change, soit l'écart est noté dans sa ligne.
