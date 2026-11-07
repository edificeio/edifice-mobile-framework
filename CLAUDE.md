# CLAUDE.md

Instructions pour les agents IA (Claude Code, etc.) travaillant sur ce dépôt.
Le code et les commentaires sont en **anglais**.

> **Conventions de l'équipe (git, commits, nommage, React / TypeScript, commentaires, i18n) : lire [`.claude/docs/CONVENTIONS.md`](.claude/docs/CONVENTIONS.md) avant toute opération git ou toute écriture de code** (non chargé automatiquement).

## 1. Projet

Application mobile **iOS & Android (smartphone uniquement)** : client d'un **Espace Numérique de Travail (ENT)** pour les **enseignants, parents et élèves**. L'application n'a pas de logique serveur propre : elle consomme les APIs backend de l'ENT.

- **Stack** : React Native **bare (pas d'Expo)**, TypeScript, Redux, react-navigation, react-native-firebase, Phrase (i18n), Swift / Kotlin (natif), Fastlane, CocoaPods.
- **Marque blanche** : une même base de code produit plusieurs apps (neo, one, ent77, openent, lyceeconnecte, …) via un système d'**overrides** (voir §3).

### Lien front ↔ back (résumé)

- Authentification via **OAuth2** auprès de la plateforme ENT ciblée ; l'application stocke le token et gère la **session** (refresh, expiration, déconnexion). Code de référence : `src/framework/util/oauth2.ts`, module `src/framework/modules/auth`.
- Les appels réseau passent par la couche transport (`src/framework/util/transport`) et les `service/` de chaque module. Ne pas appeler `fetch` directement dans un écran.
- Les droits/fonctionnalités dépendent de la plateforme et du profil utilisateur (élève, parent, enseignant) : tenir compte des droits (`rights.ts` dans les modules, `resourceRights.ts`) avant d'afficher une fonctionnalité.

### Architecture

- **Système de modules** : `src/framework/modules/<module>/` (ex. `communities`, `news`, `auth`, `mails`, …). Un module typique contient `module-config.ts`, `index.ts`, `navigation/`, `screens/`, `components/`, `service/`, `model/`, `store.ts`/`reducer.ts`, `notif-handler.ts`.
- Composants partagés : `src/framework/components`. Navigation : `src/framework/navigation`. Utilitaires : `src/framework/util`.
- Documentation d'onboarding dev / fonctions principales du framework : **à compléter** (seul `src/framework/modules/mails/DOCUMENTATION.md` existe aujourd'hui dans le dépôt). Si tu as besoin d'une info absente, demande plutôt que d'inventer.

## 2. Règles de collaboration

- **Imiter ce que le dépôt fait déjà avant d'inventer.** Cherche un équivalent existant (module, composant, hook, service) et suis ses conventions.
- **Pas de nouvelle dépendance** (JS, Pod, Gradle) sans validation explicite du dev.
- **Natif (`ios/`, `android/`)** : explicite toute modification prévue et **demande l'accord avant**.
- **Branches** : demande avant d'en créer.
- **Commits** : format et types dans `.claude/docs/CONVENTIONS.md` §2. Ne commit/push que sur demande.
- **Plans en plusieurs étapes** : préférer des **lots de petite taille**, vérifiables séparément.
- **Pas de code sans dire comment on le vérifie** (test, lint, type-check, critère observable).
- **Ne pas générer de tests** sauf demande explicite.

## 3. Overrides (marque blanche)

**Un override doit être actif pour lancer l'application.**, **par défaut, `dev/default`**; si un autre override est déjà actif, conserve-le. L'override actif est décrit dans `override.json` (à la racine).

```bash
node cli/override.js -v --no-i dev/default   # appliquer dev/default (non interactif)
yarn override-restore                         # restaurer l'état d'origine
```

- Applique `dev/default` **avant** de modifier du code, et `yarn override-restore` **après** : l'override réécrit des fichiers suivis par git (ex. `override.json`, `phrase.json`, `src/platforms/*`) — ne pas les committer par erreur.
- Regarde `override.json` avant toute action : si l'override actif n'est pas `dev/default`, applique `dev/default`.
- Ne jamais afficher ni committer de secrets (`phrase.json`, `.phrase.yml`, tokens, clés Firebase).

## 4. Vérification (à faire à la fin de toute modification de un ou plusieurs fichiers)

```bash
yarn ts-all     # tsc --noEmit  (type-check)
yarn lint-all   # eslint .
```

> Note : le script de type-check s'appelle `ts-all` dans `package.json` (pas `tsc-all`).

**Si tu n'as pas pu lancer l'un des deux (ou le lint), dis-le explicitement** — ne pas affirmer que « ça passe » sans l'avoir exécuté. Pour un changement visuel/natif, décris le critère observable (écran, comportement attendu) ; ne pas présenter un changement UI comme vérifié sans l'avoir vu tourner.

## 5. Exemples de référence par type de chantier

> À valider/ajuster par l'équipe : à chaque type de chantier correspond **un exemple récent et de qualité** (jamais le module `blog`, ancien).

| Chantier | Exemple à imiter |
| --- | --- |
| Nouveau module / structure | `src/framework/modules/communities` (module récent, activement maintenu) |
| Écran + hooks | `src/framework/modules/communities/screens/*` |
| Service / appels backend | `src/framework/modules/communities/service/*` |
| Composant UI partagé | `src/framework/components/*` — _exemple précis à désigner_ |
| Navigation / navbar | `src/framework/modules/communities/hooks/use-community-navbar` |
| Auth / session | `src/framework/modules/auth` — _à confirmer_ |
| i18n | `assets/i18n/fr.json` + clés des écrans communities |

Si aucun exemple ne convient pour ton chantier, signale-le et demande lequel suivre plutôt que de copier un module ancien.

## 6. Déroulé d'un ticket

Dès qu'un développeur démarre un ticket (bug ou feature), **lis d'abord `.claude/docs/TICKET-WORKFLOW.md`** (non chargé automatiquement) et suis-le dans l'ordre : brief → plan (mode plan) → implémentation → test sur simulateurs Android et iOS.

## 7. Design system

Les styles se trouvent **uniquement dans un fichier `styles.ts`** à côté du composant ou de l'écran, sauf les styles de navigation, définis dans l'écran. Pour tout ajout ou modification de style, applique la rule **`DESIGN`** (`.claude/rules/DESIGN.md`) : couleurs issues de `src/app/theme.ts`, valeurs de design issues de `src/framework/components/constants.ts`, aucune valeur en dur.