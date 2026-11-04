# Conventions de edifice-mobile-framework

Source unique des conventions de l'équipe, pour les devs et les agents IA. Elles priment sur le dépôt : si le code contredit une règle, le signaler, ne pas l'imiter.

**Déjà vérifié par le lint** (`eslint.config.js`, `.prettierrc`) : formatage, ordre des imports, clés triées, pas de style inline, pas de texte brut hors des composants texte, règles des hooks, `console.log` interdit. Lancer `npx eslint --fix <fichiers modifiés>`, jamais `yarn lint-fix` (il reformate tout le repo).

## 1. Git

### Branches

```
main                      production, jamais de commit direct
dev/m.n.r                 version en chantier (ex. dev/1.17.10)
└── dev/<squad>           intégration de la squad (ex. dev/comm, dev/peda)
    └── <type>/<squad>/…  travail : feat/comm/IMPULS-6276-sent-notifications, fix/comm/IMPULS-6434
        └── feat/…       brouillons locaux
```

`<type>` : `feat`, `fix`, `chore`, `refactor`, `update` (upgrade de stack). Tout ticket de plus de 3 story points a sa branche de travail ; les autres tiennent en un seul commit.

### Règles

- **Descendre = rebase.** Un enfant se rebase sur son parent, jamais de merge dans ce sens (les commits du parent réapparaîtraient en double à la remontée).
- **Remonter = merge + squash, une seule fois.** La branche de travail entre dans `dev/<squad>` finie et testée, conflits résolus au rebase. `dev/<squad>` entre dans `dev/m.n.r` à la préparation d'une RC.
- **Cascade** : mettre à jour `dev/<squad>`, puis chaque branche de travail, puis les brouillons. Sauter un étage laisse les branches du bas sur l'ancien parent.
- **Reports entre versions** (`dev/1.5.0` → `dev/1.5.1` → `dev/1.5.2`) : souvent, peu de commits, en cascade, à l'initiative des devs de la branche cible.
- **Fichiers de build** (`cli/last-build.json`, `cli/prepare-build.json`, `packageManager`) : la branche courante garde les siens. Les dépendances se tranchent champ par champ.
- **Push** : le dev pousse au moins chaque soir (branche temporaire si besoin). Un agent IA ne pousse jamais, il donne la commande(acceptable).

## 2. Commits

Format : `type(scope): TICKET, description en minuscules`, sans `#`.
Ex. `feat(cantine): IMPULS-6346, scroll the menu under a collapsing structure picker`.

- Types : `feat`, `fix`, `chore`, `refactor`, `perf`, `update` (stack), `release`. Le ticket est obligatoire sauf pour les commits techniques (`chore(stack): …`) et générés (`release: …`).
- Le message dit ce que fait le commit, pas d'où vient la demande.
- Un commit = une chose. Deux commits ne portent pas la même heure.
- Non poussé : `fixup` / `amend`. Poussé avec PR ouverte : nouveau commit, jamais de réécriture.
- Un agent IA fait valider ses messages avant de committer.

Commitlint et husky sont désactivés (`.husky/*-todo`) : rien ne vérifie le message.

## 3. Fichiers

- Dossiers et fichiers en **kebab-case**. Les anciens (`listItem.tsx`, `GridList.tsx`) ne sont pas des modèles.
- **Composant** : `component.tsx`, `styles.ts`, `types.ts`, `index.ts`. Ex. `communities/components/community-members-pill`. Déclinaisons : un dossier parent dont l'`index.ts` exporte chaque sous-dossier.
- **Écran** : pareil avec `screen.tsx`. Types regroupés en namespace (`NavParams`, `NavigationProps`, `AllProps`), options exportées en `<Nom>ScreenOptions`. Ex. `communities/screens/list`.
- **`index.ts`** : `export { default } from './component';` + `export type { … } from './types';`. Jamais `import` puis `export default` (la plupart des `index.ts` de communities le font encore).
- **Imports** : alias `~/` et `ASSETS/`, jamais `../../`. `./` seulement pour le dossier courant, après les `~/`. `Text` et `Image` viennent de `~/framework/components/text` et `picture`, pas de `react-native`.

## 4. Nommage

- Un nom dit ce que la chose **est ou fait**. Bannir `same`, `next`, `data`, `context`, `item` quand ce n'en est pas un.
- Nommer d'après le cas : `renderLoading` / `renderError` / `renderLoaded`. Pixels ≠ index : `scrollOffset`, pas `scrolled`.
- Un `*-config.ts` expose un objet déclaratif ; un fichier qui agit ne s'appelle pas config.
- Vérifier qu'un nom n'est pas déjà pris dans le module.
- Setter : `[name, setName]`. Pas de prop métier nommée comme une prop React (`style` → `variant`).
- Le `name` d'un registre et les clés backend ne sont jamais des clés i18n.
- Pas d'abstraction sans deux usages réels (générique à un seul type, alias qui n'ajoute rien : à retirer).

## 5. UI

- `theme.palette.*`, `UI_SIZES.*` (ne pas redéfinir une valeur qui y existe), `getScaleWidth()` pour toute autre dimension.
- Zones de clic ≥ 48 × 48, espacées de 8 : `UI_STYLES.clickZone`.
- `testID` en kebab-case sur les éléments interactifs (`header-back`, `tabbar-communities`).
- Styles conditionnels en nombre fini nommés au niveau du module : `style={selectable ? TAB_STYLE : styles.item}`, pas `[a, cond && b]`.
- Listes longues : `PaginatedFlashList` ou FlashList, pas de `ScrollView`. Préférer les composants du framework.

## 6. React et TypeScript

- Composants fonctionnels + hooks, pas de nouvelle classe.
- Pas de composant défini dans un composant (Sonar S6478), pas de fonction fléchée dans le JSX, pas de ternaire imbriqué.
- `useMemo` / `useCallback` si l'identité est observée ou le calcul mesuré coûteux. `useMemo(…, [])` = constante à sortir du composant. `React.memo` pour un composant rendu souvent aux props stables.
- Dépendances de hooks granulaires (`item.id` plutôt que `item`). Aucun hook après un `return` anticipé.
- Rendu conditionnel par ternaire (`cond ? <X /> : null`) : `0 && …` fait planter React Native.
- Déclarer une valeur dans la branche qui l'utilise ; ce qui ne dépend de rien monte au niveau du module.
- `===`, `?.`, enums en chaînes (`APPLE = 'Apple'`), jamais `any`, `void` si rien n'est retourné, `6_000_000_000`.
- Type de retour explicite sur les fonctions exportées de `service/` et `util/` (API publique d'un module) ; ailleurs, laisser TypeScript l'inférer.
- Tableaux : la lisibilité d'abord (`map`, `filter`). `for...of` seulement sur un gros tableau ou du code appelé souvent (rendu de liste, boucle).
- `Promise.all` pour ce qui peut être parallèle.
- Retirer ses `console.log` avant de pousser : rien ne les retire automatiquement.

## 7. Commentaires

En anglais,consis. Ils expliquent le **pourquoi** (maquette, contournement, décision écartée), jamais une paraphrase. En remplaçant du code, reporter ses commentaires de règles métier. Supprimer un commentaire devenu faux.

## 8. i18n

- Pas de texte en dur : `I18n.get('<clé>')`.
- Clés `module-screen-key`, en anglais, minuscules, mots composés sans tiret, une clé par écran : `blog-createpost-confirm-unsaved`.
- Nouvelles clés en FR uniquement. Ne pas modifier une valeur existante : l'inventorier (clé, valeur, changement) pour l'équipe.
- Vérifier avec `yarn i18n-unused` et `yarn i18n-diff`.

## 9. Avant de pousser

- Tester iOS **et** Android (simulateur à défaut d'appareil), petit et grand écran pour l'UI.
- Formulaires sur appareil physique : champ et saisie visibles clavier ouvert, « Suivant » passe au champ suivant.
- Perf : `why-did-you-render` (ligne à décommenter dans `wdyr.js`) et `console.time()`, jamais commités.
- Revue : avant de créer un composant ou une logique, vérifier l'existant (composants partagés, `timelineWidgets`, `CustomRegister`, `getNotifTypeLookupMap`) ; sinon justifier dans la PR.

## Suivis

- Ajouter `update` et `release` à `commitlint.config.js` le jour où les hooks sont réactivés.
- Le message de `no-restricted-imports` renvoie vers `@app/blueprints`, qui n'existe plus.
