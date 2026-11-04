# Plus tard

Ce qui est volontairement remis à plus tard. **Ne pas le démarrer sans décision.** Un module migré qui en dépend garde l'ancien mécanisme (ou la solution provisoire décidée) et laisse un `ToDo(<module>-migration)` dans le code.

Quand un sujet est repris, le retirer d'ici et le noter dans [JOURNAL.md](JOURNAL.md).

## Sujets reportés

Chantiers entiers, pas encore commencés.

| Sujet                                        | Depuis     | Ce qui reste en ancien en attendant                                                                                                                                                                       |
| -------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Notifications : ouverture, redirection       | 2026-11-04 | Pas d'équivalent de `notif-handler.ts` / `registerNotifHandlers` dans le nouveau système. Question d'architecture liée (notifications vs `timeline`) dans [STATUS.md](STATUS.md).                         |
| Intents (`openIntent`, `src/app/intents.ts`) | 2026-11-04 | `media` (`useOpenMedia`) y délègue l'ouverture des ressources d'apps ; `myapps` ne les reprend pas.                                                                                                       |
| Modal / FormSheet « as promise »             | 2026-11-04 | Ouvrir une modale et `await` son résultat. Candidats : `ManageFavoritesModalScreen` de `myapps`, sélecteurs (`BlogSelectScreen`, `HomeworkSelectScreen`). Les modales restent pilotées comme aujourd'hui. |

## Décisions à revoir

Acceptées pour avancer, mais à rediscuter.

| Sujet                                 | Depuis     | Solution provisoire                                                                                                                                                                                                                                                 | Ce qui pourrait changer                                                                                                                                             |
| ------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Libellé de l'onglet `myapps`          | 2026-11-04 | `myapps` n'a pas de `matchEntcoreApp` (sinon il s'ajoute à `hasRight` et masque l'onglet sans l'app `Portal` dans les droits) : son libellé vient de l'i18n `myapps-app-portal` (« Mes applis »). Voir [myapps.md](myapps.md) §5.1.                                 | Reprendre le nom de l'app `Portal` du serveur, ce qui demande un moyen de lier un module à une app ENT **sans** en faire une condition de droit.                    |
| Libellés de tous les onglets          | 2026-11-04 | `useTabLabel` : nom de l'app du serveur liée au module (`matchEntcoreApp`), sinon i18n. Le libellé dépend donc des droits et des données chargées. Voir [myapps.md](myapps.md) §5.5.                                                                                | Libellé fixe par module (i18n seul), ou déclaré dans `tab`.                                                                                                         |
| Recherche de `MyAppsFilters`          | 2026-11-04 | Portée telle quelle (recherche animée faite main). Voir [myapps.md](myapps.md) §4 n° 13.                                                                                                                                                                            | Barre de recherche native du header (`headerSearchBarOptions`) : change l'UI.                                                                                       |
| Détails de `GET /api/me/applications` | 2026-11-04 | Bibliothèques : détection actuelle (adresse `library.edifice.io` sans catégorie), `libraries` ignoré. Libellés : chaîne i18n actuelle (`getAppName`), `appName` ignoré. Pas de repli sur `/applications-list` + `/myApps/config`. Voir [myapps.md](myapps.md) §5.3. | `libraries: true` remplace la détection ; `appName` comme libellé (selon sa langue) ; repli si l'API manque sur une plateforme (le chargement bloque la connexion). |
