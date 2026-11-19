# Modules de référence

Modules **relus en détail par un développeur**, à imiter. Seuls ceux de ces tableaux servent de modèle : un module qui n'y figure pas n'a pas encore été validé, il ne sert pas d'exemple. Fichier commun aux deux skills.

## Pour la bascule (`/migrate-module`)

| Module | Emplacement | Type | Basculé le | À imiter pour | Fiche |
| --- | --- | --- | --- | --- | --- |
| — | | | | Aucun module validé pour l'instant. Candidat : `support` (`src/framework/modules/support`, un écran, sans modale), en attente de la relecture du développeur. En attendant, suivre [BASCULE.md](BASCULE.md) et les modèles de gestes qu'il cite (`wayf.tsx`, `favorites/index.tsx`) | [support.md](journal/support.md) |

## Pour l'assainissement (`/sanitize-module`)

| Module | Emplacement | Type | Terminé le | À imiter pour | Fiche |
| --- | --- | --- | --- | --- | --- |
| `myapps` | `src/modules/myapps` | `EntModule` | 2026-11-10 (harmonisé le 2026-11-19) | **Le modèle par défaut d'un module fonctionnel.** Structure (`model/` par objectif, `actions.ts` qui reçoit la session, `service/` avec `types.ts` + `adapter.ts`, `store/` Redux `createSessionReducer`, `storage.ts`, `session.ts`), API publique `hooks/`, écrans en dossiers (`screens/<écran>/screen.tsx` + `index.ts`), écran avec header par options (`screens/home/`), sheets `formSheet` (`screens/menu/`, `screens/app-actions/`, contenu commun dans `components/sheet/`), composants avec `index.ts` (`components/<composant>/`), `useConfirmRemove` et `setOptions` avec les nouveaux items (`screens/favorites/`), `withSession`, tests colocalisés. | [myapps.md](journal/myapps.md) |
| `auth` | `src/modules/auth` | `CoreModule` | 2026-10-27 (assaini en partie le 2026-11-19) | Module **réécrit** : façades `@deprecated` aux anciens chemins (`src/framework/modules/auth`), API publique en trois dossiers (`hooks/`, `hoc/`, `components/`), gabarits réutilisables (`templates/`), cycle de session ; `service/types.ts` avec des alias vers le modèle (format identique). **Pas** pour : ses classes (`wayf`, `activation`), `moment`, `model/business.ts` qui lit le store (fiche §5). | [auth.md](journal/auth.md) |

Remarques :

- Les deux modèles d'assainissement sont dans `src/modules/` (modules réécrits). Un module basculé **sur place** dans `src/framework/modules/` garde son emplacement : imiter la structure de `myapps` à l'intérieur du dossier existant, sans le déplacer (CONVENTIONS « Portage »).
- `auth` est un cas à part (module technique central) : l'imiter pour les façades et l'API publique, pas pour ses stores zustand ni ses flows (pas de passage à zustand, hors des deux skills).
- `communities` (cité par `CLAUDE.md` §5) est de l'ancienne génération : il ne sert pas de modèle.

## Ajouter un module

À faire **seulement à la demande du développeur**, après sa relecture complète du module (pas à la fin d'une session par défaut).

1. Vérifier le statut de la fiche : `joué dans l'app` pour la bascule ; sujets de §9 `fait` pour l'assainissement. Plus de question bloquante.
2. Demander au développeur ce que le module illustre de mieux que les modèles existants (ex. un module avec onglet, des modales, un écran en classe, des façades).
3. Ajouter une ligne au bon tableau (date, à imiter pour, lien vers la fiche). Garder `myapps` en tête de l'assainissement tant que le développeur ne désigne pas un autre modèle par défaut.
4. Si le nouveau module contredit un modèle existant (structure, nommage), le signaler : soit une règle de [CONVENTIONS.md](CONVENTIONS.md) ou de [BASCULE.md](BASCULE.md) change, soit l'écart est noté dans sa ligne.
