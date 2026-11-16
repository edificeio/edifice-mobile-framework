# Dépendances transverses : état de migration

Le framework est en chantier. Pour chaque élément transverse dont dépend le module (composant, utilitaire, autre module, mécanisme de l'ancien système), **vérifier son état dans le code et dans `docs/migrations/STATUS.md`** : ne jamais supposer qu'il est migré, ni qu'il est figé.

## Sources de vérité, dans l'ordre

1. Le code : le fichier existe-t-il dans le nouveau système ? Porte-t-il `@deprecated` ? Un `ToDo(<x>-migration)` ?
2. `docs/migrations/STATUS.md` (« Chantiers transverses », « Questions ouvertes ») et `later.md` (sujets à ne pas démarrer sans décision).
3. `docs/ARCHITECTURE.md` §6 « Fonctionnalités de l'ancien système absentes du nouveau ».
4. Les fiches des modules concernés (`docs/migrations/<x>.md`, §7 et §8).

La liste ci-dessous est un point de départ daté : la revérifier à chaque migration.

## Catégories

| Catégorie                     | Signe                                                                   | Que faire                                                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Migré**                     | Nouveau système, sans `@deprecated`                                     | L'utiliser. Lire son API dans le code (elle a pu changer depuis la fiche).                                                                                                                                         |
| **Façade `@deprecated`**      | Ancien chemin qui lit le nouveau code                                   | Le module migré utilise la nouvelle API, pas la façade. Si la nouvelle API ne couvre pas le besoin : question.                                                                                                     |
| **Ancien, à migrer**          | Module ou chantier `à faire` / `en cours` dans STATUS                   | Question : (A) le migrer d'abord (préalable, sa propre fiche) ; (B) l'utiliser tel quel avec un `ToDo(<module>-migration)` ; (C) en migrer seulement la partie utile, dans le framework, en phase 0.               |
| **Absent du nouveau système** | ARCHITECTURE §6, ou rien de comparable dans `src/app/` / `src/modules/` | Question : (A) reporter (`later.md` + `ToDo`, fonctionnalité absente en attendant) ; (B) concevoir l'évolution du framework (phase 0, à spécifier avec le développeur) ; (C) solution provisoire locale au module. |
| **Candidat au framework**     | Code du module générique, ou importé par d'autres modules               | Question : (A) le remonter dans le framework (`src/framework/components`, `src/framework/util`, `src/app/…`) ; (B) l'exposer en API publique du module (`hooks/`, `components/`) ; (C) le laisser.                 |
| **Framework pas sec**         | API migrée qui ne couvre pas le besoin (option, typage, cas oublié)     | Proposer l'évolution, en listant les autres utilisateurs de l'API (`grep`). Ne pas tordre le module autour en silence, ne pas changer l'API sans accord.                                                           |

Format d'une question dans §8 de la fiche :

```md
N. **<sujet>** (`<chemin ou API>`, état : <catégorie>). <constat en une ou deux phrases>.

- A) … — conséquence.
- B) … — conséquence.
- Recommandation : <option> (<raison>).
```

## Signaux connus (à revérifier)

| À chercher dans le module                                                          | Ce que c'est, et la piste                                                                                                                                                                             |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `~/framework/modules/auth`                                                         | Façades `@deprecated`. API publique : `~/modules/auth/hooks/*`, `hoc/*`, `components/*` ; getters, `flows`, `model` acceptés. **Jamais `~/modules/auth`** (index chargé en différé). Fiche `auth.md`. |
| `~/framework/util/media-deprecated`, `react-native-fast-image`, `-video`, `-pdf`   | Interdits : composants ponts de `~/modules/media/components` (`Image`, `FastImage`, `Video`, `Pdf`) ; ouvrir un média : `useOpenMedia()`. Fiche `media.md`.                                           |
| `~/framework/modules/audience`                                                     | Migré en partie seulement (STATUS, question ouverte n° 2) : composants et écrans de réactions encore anciens.                                                                                         |
| `~/framework/modules/myapps`                                                       | Supprimé. Affichage d'une app : `useEntAppDisplay`, `useModuleAppDisplay`, `EntAppImage`, `ModuleImage` ; ouvrir un module : `useOpenModule`.                                                         |
| `~/app/navigation` (ancien) , `headerAction`, `navBarOptions`                      | Ancienne navigation, à remplacer par `~/app/navigation-new` (`defineScreen`, `defineModal`, `headerLeftActions` / `headerRightActions`). Modèles : `src/modules/myapps/screens/`.                     |
| `AllModules`, `moduleConfig.*` d'un autre module                                   | Registre statique retiré : `useModules()`, `useModule(name)`, `useModulesRecord()` (CONVENTIONS « Portage »).                                                                                         |
| `callAtLogin`                                                                      | Déprécié : `sessionSetup` / `onSessionStart` (`src/app/module/types.ts`).                                                                                                                             |
| `notif-handler.ts`, `registerNotifHandlers`                                        | **Absent** du nouveau système. Question architecture n° 1 de STATUS (notifications vs `timeline`) : ne pas improviser.                                                                                |
| `src/app/intents.ts`                                                               | Legacy, reporté (`later.md`).                                                                                                                                                                         |
| Widgets / sections de l'accueil                                                    | Pas d'équivalent connu dans le nouveau système (un module `home` est évoqué dans `timeline.md`) : question.                                                                                           |
| `displayAs: 'myAppsModule'`, `display*`, `displayBadges`                           | **Absents** de `ModuleConfig` (ARCHITECTURE §6). Libellé d'onglet : `tab.labelI18n` ou l'app ENT.                                                                                                     |
| Présence dans `src/app/override/modules.ts` / `__overrides__/*/modules.ts`         | Liste des modules **par marque** dans l'ancien système. Le nouveau registre `src/app/config/modules.ts` n'est pas surchargé par marque : question si le module n'est pas dans toutes les marques.     |
| `CustomBottomSheetModal`, `@gorhom/bottom-sheet`, `ModalBox`, `react-native-modal` | Conversions d'UI imposées (CONVENTIONS « UI »).                                                                                                                                                       |
| Ancien storage, clés à la racine                                                   | `Storage.account` / `Storage.device` (`~/framework/util/storage`), déclarés dans `storages`, clés inchangées, migrations.                                                                             |
| Fonctions du transport sur des chemins du module                                   | `getModuleTransport('<module>')` (`~/framework/util/transport/module-transport.ts`).                                                                                                                  |
| Composant d'un autre module ancien                                                 | Catégorie « Ancien, à migrer » ou « Candidat au framework ».                                                                                                                                          |
