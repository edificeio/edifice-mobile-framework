# Conventions de edifice-mobile-framework

Source unique des conventions de l'équipe, pour les devs et les agents IA. Elles priment sur le dépôt : si le code contredit une règle, le signaler, ne pas l'imiter.

**Déjà vérifié par le lint** (`eslint.config.js`, `.prettierrc`) : formatage, ordre des imports, clés triées, pas de style inline, pas de texte brut hors des composants texte, règles des hooks, `console.log` interdit. Lancer `npx eslint --fix <fichiers modifiés>`, jamais `yarn lint-fix` (il reformate tout le repo).

## 1. Git

### Branches

```
main                      production, jamais de commit direct
dev/m.n.r                 version en chantier (ex. dev/1.17.10)
└── dev/<squad>           intégration de la squad (ex. dev/comm, dev/peda)
    └── <type>/<squad>/…  travail : feat/comm/IMPULS-XXXX-sent-notifications, fix/comm/IMPULS-XXXX
```

`<type>` : `feat`, `fix`, `chore`, `refactor`, `update` (upgrade de stack). Tout ticket de plus de 3 story points a sa branche de travail ; les autres tiennent en un seul commit.

### Règles

- **Descendre = rebase.** Un enfant se rebase sur son parent, jamais de merge dans ce sens (les commits du parent réapparaîtraient en double à la remontée).
- **Remonter = merge + squash, une seule fois.** La branche de travail entre dans `dev/<squad>` finie et testée, conflits résolus au rebase. `dev/<squad>` entre dans `dev/m.n.r` à la préparation d'une RC.
- **Cascade** : mettre à jour `dev/<squad>`, puis chaque branche de travail. Sauter un étage laisse les branches du bas sur l'ancien parent.
- **Reports entre versions** (`dev/1.5.0` → `dev/1.5.1` → `dev/1.5.2`) : souvent, peu de commits, en cascade, à l'initiative des devs de la branche cible.
- **Fichiers de build** (`cli/last-build.json`, `cli/prepare-build.json`, `packageManager`) : la branche courante garde les siens. Les dépendances se tranchent champ par champ.
- **Push** : le dev pousse au moins chaque soir (branche temporaire si besoin).

## 2. Commits: conventional commit

Format : `type(scope): TICKET, description en minuscules`, sans `#`.
Ex. `feat(cantine): IMPULS-XXXX, scroll the menu under a collapsing structure picker`.

- Types : `feat`, `fix`, `chore`, `refactor`, `perf`, `update` (stack), `release`. Le ticket est obligatoire sauf pour les commits techniques (`chore(stack): …`) et générés (`release: …`).
- Le message dit ce que fait le commit, pas d'où vient la demande.
- Un commit = une chose spécifique.

Commitlint et husky sont désactivés (`.husky/*-todo`) : rien ne vérifie le message.

## 3. Fichiers

- Dossiers et fichiers en **kebab-case**. Les anciens (`listItem.tsx`, `GridList.tsx`) ne sont pas des modèles.
- **Composant** : `component.tsx`, `styles.ts`, `types.ts`, `index.ts`. Ex. `communities/components/community-members-pill`. Déclinaisons : un dossier parent dont l'`index.ts` exporte chaque sous-dossier.
- **Écran** : pareil avec `screen.tsx`. Types regroupés en namespace (`NavParams`, `NavigationProps`, `AllProps`), options exportées en `<Nom>ScreenOptions`. Ex. `communities/screens/list`.
- **`index.ts`** : `export { default } from './component';` + `export type { … } from './types';`. Jamais `import` puis `export default` (la plupart des `index.ts` de communities le font encore).
- **Imports** : alias `~/` et `ASSETS/`, jamais `../../`. `./` seulement pour le dossier courant, après les `~/`. `Text` et `Image` viennent de `~/framework/components/text` et `picture`, pas de `react-native`.
- **`index.ts`** : `export { default } from './component';` + `export type { … } from './types';`. Jamais `import` puis `export default` (la plupart des `index.ts` de communities le font encore). Cette forme répond à Sonar S7763 (« Use `export…from` to re-export ») et prime sur l'ancienne convention Confluence. Export nommé en plus du défaut : `export { default, default as Nom } from './component';`.

## 4. Nommage

- Un nom dit ce que la chose **est ou fait**. Bannir `same`, `next`, `data`, `context`, `item` quand ce n'en est pas un.
- Nommer d'après le cas : `renderLoading` / `renderError` / `renderLoaded`. Pixels ≠ index : `scrollOffset`, pas `scrolled`.
- Un `*-config.ts` expose un objet déclaratif ; un fichier qui agit ne s'appelle pas config.
- Vérifier qu'un nom n'est pas déjà pris dans le module.
- Setter : `[name, setName]`. Pas de prop métier nommée comme une prop React (`style` → `variant`).
- Le `name` d'un registre et les clés backend ne sont jamais des clés i18n.
- Pas d'abstraction sans deux usages réels (générique à un seul type, alias qui n'ajoute rien : à retirer). Pas de fonction qui ne fait que retourner un objet statique : déclarer l'objet là où il sert.
- Une fonction qui **retourne** une action (navigation, Redux) ne porte pas le verbe de l'action : elle ne navigue pas elle-même. `getBlogPostsActions`, pas `goToBlogPosts`.

## 5. UI

- `theme.palette.*`, `UI_SIZES.*` (ne pas redéfinir une valeur qui y existe), `getScaleWidth()` pour toute autre dimension. Pas de nombre magique : une valeur hors `UI_SIZES` est une constante nommée, justifiée par la maquette.
- Code couleur propre à un module : directement dans `theme.palette.<module>`, sans étage sémantique supplémentaire dans `theme.ui`.
- Zones de clic ≥ 48 × 48, espacées de 8 : `UI_STYLES.clickZone`.
- `testID` en kebab-case sur les éléments interactifs (`header-back`, `tabbar-communities`).
- Styles conditionnels en nombre fini nommés au niveau du module : `style={selectable ? TAB_STYLE : styles.item}`, pas `[a, cond && b]`.
- Listes longues : `PaginatedFlashList` ou FlashList, pas de `ScrollView`. Préférer les composants du framework.

## 6. React et TypeScript

- Composants fonctionnels + hooks, pas de nouvelle classe. JSX plutôt que `React.createElement` (renommer le fichier en `.tsx`).
- Tout composant (pas seulement un écran) qui dépend d'une session active est wrappé avec `withSession` (`~/framework/modules/auth/util`).
- Réinitialiser l'état quand une prop change : sous-composant avec `key={prop}`, pas de `useEffect` de remise à zéro ([doc React](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes)).
- Pas de composant défini dans un composant (Sonar S6478), pas de fonction fléchée dans le JSX, pas de ternaire imbriqué.
- `useMemo` / `useCallback` si l'identité est observée ou le calcul mesuré coûteux. `useMemo(…, [])` = constante à sortir du composant. `React.memo` pour un composant rendu souvent aux props stables.
- Dépendances de hooks granulaires (`item.id` plutôt que `item`). Aucun hook après un `return` anticipé.
- Rendu conditionnel par ternaire (`cond ? <X /> : null`) : `0 && …` fait planter React Native.
- Déclarer une valeur dans la branche qui l'utilise ; ce qui ne dépend de rien monte au niveau du module.
- `===`, `?.`, enums en chaînes (`APPLE = 'Apple'`), jamais `any`, `void` si rien n'est retourné, `6_000_000_000`.
- Type de retour explicite sur les fonctions exportées de `service/` et `util/` (API publique d'un module) ; ailleurs, laisser TypeScript l'inférer.
- Tableaux : la lisibilité d'abord (`map`, `filter`). `for...of` seulement sur un gros tableau ou du code appelé souvent (rendu de liste, boucle).
- Un seul parcours quand c'est possible : `some()` / `find()` plutôt que `filter()` suivi d'un test ; `reduce` (O(N)) plutôt que trier (O(N log N)) pour n'extraire qu'un élément.
- Dates : `Temporal` (`@js-temporal/polyfill`) dans le nouveau code, plus de `moment`. Pas de format maison : `Temporal.PlainDate` fournit l'ISO.
- `Promise.all` pour ce qui peut être parallèle.
- Retirer ses `console.log` avant de pousser : rien ne les retire automatiquement. Idem pour les props, fonctions et exports inutilisés.

## 7. Données, réseau et modules

- Donnée partagée entre plusieurs écrans, ou mise en cache : **store Redux du module**, jamais un state dupliqué dans chaque composant ni une variable globale.
- Lors de l'utilisation de Redux, s'assurer du respect des bonnes pratiques https://redux.js.org/style-guide/
- Un écran atteignable directement (notification, lien, autre onglet) charge lui-même la donnée absente du store, sans supposer qu'un écran précédent l'a chargée.
- `sessionFetch` préfixe l'URL de la plateforme, lève une `HTTPError` si le statut n'est pas ok, et `sessionFetch.json<T>()` parse la réponse : ne pas le refaire à la main.
- Pas d'appel par élément d'une liste (N+1) : vérifier si l'API fournit l'info en un appel, sinon le signaler au back. `Promise.all` parallélise mais ne réduit pas le nombre d'appels.
- Un module ne référence pas un autre module en dur (ex. `Timeline` dans Blog) : remonter la décision d'un cran dans la navigation.
- Un helper générique retourne `undefined` plutôt qu'un repli sur un module précis ; c'est l'appelant qui choisit sa valeur par défaut.

## 8. Commentaires

En anglais, concis. Ils expliquent le **pourquoi** (maquette, contournement, décision écartée), jamais une paraphrase. Supprimer un commentaire devenu faux.

## 9. i18n

- Pas de texte en dur : `I18n.get('<clé>')`.
- Clés `module-screen-key`, en anglais, minuscules, mots composés sans tiret, une clé par écran : `blog-createpost-confirm-unsaved`.
- Nouvelles clés en FR uniquement. Ne pas modifier une valeur existante : l'inventorier (clé, valeur, changement) pour l'équipe.
- Vérifier avec `yarn i18n-unused` et `yarn i18n-diff`.

## 10. Avant de pousser

- Tester iOS **et** Android (simulateur à défaut d'appareil), petit et grand écran pour l'UI.
- Formulaires sur appareil physique : champ et saisie visibles clavier ouvert, « Suivant » passe au champ suivant.
- Perf : `why-did-you-render` (ligne à décommenter dans `wdyr.js`) et `console.time()`, jamais commités.
- Revue : avant de créer un composant ou une logique, vérifier l'existant (composants partagés, utilitaires du framework) ; sinon justifier dans la PR.
- SonarQube : après génération d'une pull request, traiter les issues rouges **et** jaunes (sauf les TODO) avant de demander la review.

## 11. Pièges propres à l'app

Erreurs que le lint ne voit pas et qui cassent en production. À vérifier dans le code (pas seulement dans le diff) avant de pousser comme en revue.

- **Réseau** : pas de `fetch` direct dans un écran ou un composant ; passer par `src/framework/util/transport` et le `service/` du module (`sessionFetch`, §7).
- **Droits et profils** : une fonctionnalité, un bouton ou un écran ne s'affiche qu'après vérification des droits (`rights.ts` du module, `resourceRights.ts`) et du profil (élève, parent, enseignant). Se demander : que voit un élève ? un parent sans enfant rattaché ?
- **Session** : ne pas lire ni stocker le token, ni appeler une API hors de la session gérée par `src/framework/util/oauth2.ts` et le module `auth` (refresh, expiration, déconnexion). Composant dépendant de la session : `withSession` (§6).
- **i18n** : toute clé utilisée existe dans `assets/i18n/fr.json` ; une valeur existante modifiée est inventoriée pour l'équipe (§9).
- **Dépendances** : versions exactes, dépendance de dev quand c'est possible (`.claude/rules/PACKAGE.md`) ; une nouvelle dépendance (JS, Pod, Gradle) est annoncée dans la description de la PR.
- **Natif** : toute modification sous `ios/` ou `android/` est signalée dans la PR, avec son impact sur les overrides (`.claude/rules/NATIVE.md`).
- **Modèle** : ne pas calquer le module `blog` ni un ancien fichier en camelCase ; `communities` est la référence (§3, `CLAUDE.md` §5).
- **Robustesse** : erreur réseau gérée (état d'erreur, promesse catchée), état de chargement présent ; ni `0 && <X />` (§6), ni liste longue en `ScrollView` (§5).

## Suivis

- Ajouter `update` et `release` à `commitlint.config.js` le jour où les hooks sont réactivés.
- Le message de `no-restricted-imports` renvoie vers `@app/blueprints`, qui n'existe plus.
