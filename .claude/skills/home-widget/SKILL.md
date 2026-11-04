---
name: home-widget
description: Pose le squelette d'un widget d'accueil (carte dans la section « Widgets ») ou d'une section d'accueil (bloc de l'accueil, comme les actus) dans edifice-mobile-framework. À utiliser dès qu'on demande de créer, ajouter ou brancher un home widget, un widget de l'accueil, une home section ou une section de l'accueil.
---

# Squelette d'un widget ou d'une section de l'accueil

Ce skill pose seulement le squelette. Les droits, les données, les états et la navigation restent au dev, signalés par des `// todo`.

## Entrée

Il faut deux choses : le **type** (widget ou section) et le **nom**. Si l'un manque, le demander, et rien d'autre.

- **Section** : un bloc posé directement sur l'accueil, dans le module qui le possède. Modèle : `src/framework/modules/news/home-section.ts`.
- **Widget** : une carte dans la section « Widgets ». Elle vit dans `src/framework/modules/widgets/<nom>/`. Modèle : `src/framework/modules/widgets/screen-time/`.

Noms : le dossier et `name` sont en kebab-case (`<nom>`), les composants en PascalCase (`<Nom>`). Les imports utilisent `~/framework/...`.

## Section

Si le module `src/framework/modules/<module>/` n'existe pas, le signaler et s'arrêter : une section appartient à un module.

1. `<module>/home-section.ts`

```ts
import * as React from 'react';

import { registerHomeSection } from '~/framework/modules/home/registry';
import { <Nom>HomeSection } from '~/framework/modules/<module>/components/home-section';

export default function setUp<Nom>HomeSection() {
  registerHomeSection({
    displayOrder: 150, // todo: news = 100, widgets = 200
    isVisible: () => true, // todo: vérifier les droits de l'utilisateur
    name: '<nom>',
    renderComponent: session => React.createElement(<Nom>HomeSection, { session }),
  });
}
```

2. `<module>/components/home-section/`
   - `types.ts` : `export interface <Nom>HomeSectionProps { session: AuthActiveAccount; }`, avec `AuthActiveAccount` importé en type depuis `~/framework/modules/auth/model`.
   - `styles.ts` : copier `news/components/home-section/section/styles.ts` (`section`, `header`, `title`).
   - `component.tsx` : un `View style={styles.section}` qui contient un `HeadingSText` avec `I18n.get('home-<nom>-title')`, puis `{/* todo: contenu, chargement, vide */}`.
   - `index.ts` : `export * from './component';` et `export type * from './types';`.
3. Dans `<module>/index.ts`, importer `setUp<Nom>HomeSection` depuis `./home-section` et l'appeler après `module.exports = ...`, comme dans `news/index.ts`.

## Widget

1. `widgets/<nom>/home-widget.ts`

```ts
import * as React from 'react';

import { addHomeWidget } from '~/framework/modules/widgets/home-section';
import { <Nom>Widget } from '~/framework/modules/widgets/<nom>/components/home-widget';

export default function setUp<Nom>HomeWidget() {
  addHomeWidget({
    displayOrder: 400, // todo: carnet de bord = 100, temps d'écran = 300
    isVisible: () => true, // todo: vérifier que le widget est disponible, voir screen-time/home-widget.ts
    name: '<nom>',
    renderComponent: session => React.createElement(<Nom>Widget, { session }),
  });
}
```

2. `widgets/<nom>/components/home-widget/`
   - `component.tsx` :

```tsx
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { WidgetCard } from '~/framework/modules/widgets/components/card';

export interface <Nom>WidgetProps {
  session: AuthActiveAccount;
}

export function <Nom>Widget({ session }: Readonly<<Nom>WidgetProps>) {
  // todo: charger les données avec useHomeReload, gérer chargement, erreur et vide
  // todo: onExpand pour ouvrir l'écran du module
  return <WidgetCard title={I18n.get('widget-<nom>-title')}>{null}</WidgetCard>;
}
```

   - `styles.ts` : un `StyleSheet.create({})` vide.
   - `index.ts` : `export { <Nom>Widget, <Nom>Widget as default, type <Nom>WidgetProps } from './component';`

3. Brancher le widget :
   - **Le module existe déjà** (il a un `module-config.ts` et un `index.ts`, comme `widgets/cantine/`) : importer `setUp<Nom>HomeWidget` dans son `index.ts` et l'appeler après `module.exports = ...`.
   - **Le module n'existe pas** : créer un module minimal.
     - `module-config.ts` : copier `screen-time/module-config.ts` et laisser des `// todo` sur `entcoreScope`, `entcoreWidgetName`, `matchEntcoreApp` et `hasRight`.
     - `index.ts` : `module.exports = new NavigableModule({ config, getRoot: () => null /* todo: navigation */, reducer: () => null });`, puis `setUp<Nom>HomeWidget();`. Si `getRoot: () => null` ne passe pas `tsc`, reprendre `screen-time/navigation/navigator.tsx` avec un écran vide.
     - Ajouter `require("~/framework/modules/widgets/<nom>"),` dans le `modules.ts` de l'override actif, à côté de screen-time. Les fichiers de l'override actif sont listés dans `override.json` sous la clé `"src/app/override/modules.ts"` (par exemple `__overrides__/neo/test/modules.ts`). Dire à l'utilisateur dans quels autres overrides l'ajouter.

## Fin

1. Ajouter la clé de titre (`home-<nom>-title` ou `widget-<nom>-title`) dans les 6 fichiers `assets/i18n/{fr,en,es,it,co,fr-MQ}.json`, en ordre alphabétique. Laisser le texte français dans les fichiers des autres langues s'il n'y a pas de traduction.
2. Lancer `npx eslint --fix` seulement sur les fichiers créés ou modifiés, puis `npx tsc --noEmit`.
3. Lister les fichiers créés et les `// todo` à reprendre. Ne pas faire de commit.

Commentaires : en minuscule, courts, sur le comportement.
