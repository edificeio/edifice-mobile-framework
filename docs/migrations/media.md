# Migration : `media`

> Statut : **fait** (2026-10-29), façades encore présentes — mis à jour le 2026-11-04

## 1. Périmètre

Affichage et ouverture des médias : carrousel, lecteur PDF, téléchargement, images / vidéos / audio signés. `src/framework/modules/media` + `carousel` + `download` → `src/modules/media` (`CoreModule`, modales `media/carousel` en `fullScreenModal` et `media/download` en `transparentModal`).

## 2. Ce qui est en place

- **Signature bas niveau** : composants ponts aux mêmes noms que les natifs (`Image`, `FastImage`, `Video`, `Pdf`) dans `src/modules/media/components`, props `account?` et `signed?: false`. Hors composant : `useSignedSource` / `signSource` / `resolveUrl` (`src/modules/media/source.ts`). La signature compare les **origines** (l'ancien `startsWith` fuyait des jetons).
- **ESLint** : dans `src/modules/**` (sauf `media`), importer `FastImage`, `react-native-video` ou `react-native-pdf` est une erreur.
- **Ouvrir un média** : `useOpenMedia()` → `openCarousel`, `openPdf({ src, title })`, `openMedia(s)`.
- **Affichage** : `useMediaDisplay` (icône, vignette) ; `useResourceDisplay` (+ couleurs / icône de l'app, **lit encore le redux de `myapps`**).
- **Stockage** : date de l'alerte de confidentialité dans `Storage.device({ namespace: 'media' })`, clé `privacyAlertDate` ; la migration copie l'ancienne clé `privacyAlert` sans la supprimer (rétrocompatibilité).

## 3. Reste à faire

| Sujet                                   | Bloqué par            | Détail                                                                                                                             |
| --------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `useResourceDisplay` → nouveau `myapps` | `myapps`              | `ToDo(media-migration)` dans `src/modules/media/hooks/resource-display.ts`.                                                        |
| Ouverture des ressources d'apps         | `myapps` (intents)    | `ToDo(media-migration)` dans `src/modules/media/hooks/open-media.ts` : passe par `openIntent` (ancien).                            |
| `framework/util/media-deprecated`       | migration des modules | 35 importeurs, migrés module par module puis suppression.                                                                          |
| Façades                                 | consommateurs         | `framework/modules/media/{index,types,mime,components/*,hooks}`, shim `framework/components/carousel-multimedia/openCarousel.tsx`. |

## 4. Décisions clés

- Pas de pont WebView (le `queryParamToken` connecte ; l'éditeur riche construit son propre HTML).
- La signature utilise le compte **connecté** (`getActiveAccount`, prérequis compris).
- `openPdf` est un raccourci vers le carrousel (le carrousel est le lecteur PDF).
- Le barrel `hooks/index.ts` n'exporte **pas** `resource-display` (il charge le redux legacy de `myapps`).
