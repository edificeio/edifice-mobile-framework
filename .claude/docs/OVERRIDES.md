# OVERRIDES.md

Système d'overrides (marque blanche), à destination des agents IA.
Source : documentation interne du framework, **recoupée avec `cli/override.js` et `package.json`** (en cas d'écart, le code fait foi — les écarts connus sont listés en §8).

> Rappel `CLAUDE.md` §3 : on travaille **uniquement avec `dev/default`**. Ne jamais committer de fichier overridé ni afficher de secret (`phrase.json`, `.phrase.yml`, configs Firebase, tokens).

## 1. Principe

Un override applique, depuis un dépôt distant ou local, des modifications à l'app en marque blanche pour en faire une app fonctionnelle et publiable (App Store / Play Store). Il peut modifier des paramètres :

- **natifs** : icônes, splash screens, bundleId iOS, applicationId Android, configs Firebase… ;
- **fonctionnels** : plateformes accessibles à la connexion, modules intégrés… ;
- **design** : thème de couleurs.

## 2. Structure d'un override

Un override est un dossier de `__overrides__/` dont le chemin est son nom (ex. `__overrides__/dev/default` → `dev/default`). La correspondance fichier de l'override → fichier de l'app est définie dans `_override_copyMergePaths` (`cli/override.js`) :

| Dans l'override | Copié / fusionné vers | Rôle |
| --- | --- | --- |
| `override.json` | `override.json` | Métadonnées de l'override (**seul fichier obligatoire**) |
| `appconf.ts` | `src/app/override/appconf.ts` | Configuration de l'app + plateformes incluses |
| `modules.ts` | `src/app/override/modules.ts` | Modules fonctionnels intégrés |
| `platforms/` | `src/platforms` | Déclarations des plateformes (seules celles utilisées sont bundlées) |
| `theme.ts` | `src/app/override/theme.ts` | Couleurs du thème |
| `i18n/` | `assets/i18n/override` | `<LANG>.json` : clés i18n surchargées |
| `phrase.json`, `.phrase.yml` | racine | Configuration et **secrets** Phrase |
| `assets/` | `assets` | Assets spécifiques |
| `android/google-services.json` | `android/app/google-services.json` | Config Firebase Android |
| `android/res` | `android/app/src/main/res` | Icônes, splash screens Android |
| `android/fonts`, `android/images` | `android/app/src/main/assets/{fonts,images}` | Polices, images Android |
| `ios/GoogleService-Info.plist` | `ios/appe/GoogleService-Info.plist` | Config Firebase iOS |
| `ios/Assets.xcassets` | `ios/appe/Assets.xcassets` | Icônes, splash screens iOS |
| `ios/Fonts`, `ios/images` | `ios/Fonts`, `ios/appe/images` | Polices, images iOS |

En plus, le CLI met à jour **programmatiquement** (`_override_specialUpdates`) : `ios/appe/Info.plist`, `ios/appe.xcodeproj/project.pbxproj` et `android/gradle.properties` (ids et nom de l'app).

Tous les fichiers sauf `override.json` ont une valeur par défaut versionnée dans le framework.

### override.json

```jsonc
{
  "override": "dev/default",   // nom de l'override = chemin du dossier
  "parent":   "common",        // héritage (cf. §4)
  "appid":    "com.ode.mobile",// id de l'app
  "appname":  "Dev Pocket"     // nom affiché
}
```

## 3. Configurer un override

### modules.ts

Liste des modules intégrés. On peut surcharger la `moduleConfig` d'un module :

```ts
export default [
  require('~/framework/modules/blog'),            // ~ = src/
  require('~/framework/modules/communities'),
  [require('~/framework/modules/news'), {         // surcharge de la moduleConfig
    iconName: 'iconOverride',                     // ex. changer l'icône
    registerAs: 'tabModule',                      // ex. changer l'emplacement
  }],
];
```

### appconf.ts

```ts
export default {
  matomo: { url: 'URL_MATOMO', siteId: 3 },
  webviewIdentifier: 'aaa.bbbbbbb',               // identifiant unique incorporé aux webviews
  platforms: [                                    // accès aux plateformes proposés à la connexion
    require('~/platforms/recette'),
    {                                             // surcharge d'une plateforme
      ...require('~/platforms/formation')['formation-one'],
      displayName: 'Open Digital Education',
      logo: require('ASSETS/platforms/logo-ode.png'),
    },
  ],
};
```

### theme.ts

Surcharge des couleurs de l'app (voir la doc framework « Modification du thème dans un override » et `src/app/theme.ts`).

### Fichiers JSON

Par défaut, les `*.json` de l'override sont **fusionnés** (deepmerge) avec ceux de l'app. Exceptions **copiées telles quelles** (`_override_forceCopy`) : `assets/animations/audio/disque.json`, `android/app/google-services.json`.

## 4. Héritage

Un override peut déclarer un ou plusieurs parents (clé `parent` ou `parents`), appliqués **avant** lui, dans l'ordre :

- dossiers : fusionnés ;
- `*.json` : fusionnés (sauf `_override_forceCopy`) ;
- autres fichiers : remplacés.

```json
{ "override": "lyceeconnecte/prod", "parent": "lyceeconnecte/common" }
```

Convention par déclinaison :

- `<déclinaison>/common` : fichiers communs à la déclinaison ;
- `<déclinaison>/test` : builds Alpha / développement ;
- `<déclinaison>/prod` : builds RC / Release ;
- `common` : override racine dont tous héritent (directement ou non), qui stocke les déclarations de plateformes.

Ex. : `dev/default` hérite de `common`.

## 5. Interaction avec git

À l'application, les fichiers overridés sont **masqués à git** :

- fichiers ajoutés → ajoutés à `.git/info/exclude` (sauvegarde dans `.git/info/exclude.backup`) ;
- fichiers modifiés → `git update-index --skip-worktree`.

Conséquences :

- **Ne jamais committer de fichier overridé** : ils contiennent des informations privées.
- Un `git checkout` peut échouer si des commits touchent des fichiers overridés (ex. numéros de version) → **dé-appliquer l'override avant** (`yarn override-restore`), puis le réappliquer.

## 6. Commandes

Scripts `package.json` (tous appellent `node cli/override.js`) :

| Commande | Effet |
| --- | --- |
| `yarn override <o1> [o2 …]` | Applique les overrides (`-l` : verrouillés dans git). Récupère le dépôt des overrides (`ode.override.url` de `package.json`) dans `__overrides__/`, sur la branche du même nom que la branche courante, sinon `main` (`ode.override.defaultBranch`) |
| `yarn override-local <o1> …` | Idem avec les overrides déjà présents dans `__overrides__/`, sans mise à jour depuis le dépôt |
| `yarn override-restore` | Restaure l'état initial des fichiers overridés |
| `yarn override-restore-local` | Idem en mode local |
| `node cli/override.js -v --no-i dev/default` | **Commande à utiliser par un agent** : application non interactive (échoue au lieu d'attendre une saisie) |
| `node cli/override.js reset-cache` (ou option `-r`) | Vide le cache des overrides pour forcer un nouveau clone (lancé par `yarn clean`) |
| `node cli/override.js --help` | Aide complète |

Options utiles : `-v` verbose, `-q` quiet, `-b <branch>` branche du dépôt, `-h <uri>` URL du dépôt, `--local`, `--no-i` non interactif.

### Commandes avancées — dangereuses

Elles rendent les fichiers overridés **visibles et committables**. Usage exceptionnel (ex. modifier l'état initial des fichiers overridés), **après synchronisation avec le lead dev mobile**. Un agent ne les lance **jamais** sans demande explicite.

| Commande | Effet |
| --- | --- |
| `node cli/override.js unlock` | Rend visibles dans git tous les changements de l'override |
| `node cli/override.js lock` | Les masque à nouveau (ou réappliquer l'override) |
| `node cli/override.js stash [-m <msg>]` | Crée un stash git des fichiers overridés ; `git stash pop` restaure l'override **mais en laissant tout visible et committable** |

## 7. Règles pour les agents

1. Avant toute action : `grep '"override"' override.json`. Si ce n'est pas `dev/default`, appliquer `node cli/override.js -v --no-i dev/default`. En cas d'échec (identifiants du dépôt manquants…), demander au développeur de lancer `! node cli/override.js -v dev/default`.
2. Après le travail : `yarn override-restore`.
3. Ne jamais afficher ni committer `phrase.json`, `.phrase.yml`, `google-services.json`, `GoogleService-Info.plist`.
4. Pour modifier le comportement de l'app pour toutes les déclinaisons, modifier le **code du framework**, pas un override. Modifier un override = modifier le dépôt `edifice-mobile-config`, hors de ce repo : demander avant.

## 8. Écarts entre la doc interne et le code (à faire corriger dans la doc source)

- Les fichiers AppCenter (`android/appcenter-config.json`, `ios/AppCenter-Config.plist`) ne figurent plus dans `_override_copyMergePaths`.
- Les chemins de modules sont `~/framework/modules/<module>` (la doc montre l'ancien `~/modules/<module>`).
- Ajouts non documentés : `android/fonts`, `android/images`, `ios/Fonts`, `ios/images`, et les mises à jour programmatiques de `Info.plist`, `project.pbxproj`, `gradle.properties`.
- `yarn override restore` fonctionne (sous-commande positionnelle), mais le script dédié est `yarn override-restore`.
