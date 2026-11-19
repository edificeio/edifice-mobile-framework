# Flows `myapps` : variables, ordre, limites et points non vérifiés

> **Jamais de compte réel.** L'app traite des données d'élèves mineurs : **compte de recette uniquement**, sur une
> plateforme de recette. Identifiant et mot de passe passent par `-e` à chaque lancement, **jamais dans un fichier**
> (ni ici, ni dans un script, ni dans l'historique partagé d'un terminal). Le flow `myapps-04` **écrit** sur le compte
> (favoris, côté serveur).

> **Écrit à blanc le 2026-11-18** : aucun flow n'a tourné (pas de Maestro ni d'app sur le poste d'écriture). Les
> sélecteurs sont lus dans le code des deux générations (`selecteurs.md`), la syntaxe dans la doc officielle (liens en
> bas). Ce qui reste à confirmer est dans « Non vérifié ».

But : un oracle de non-régression pour la migration de `myapps`. Les mêmes flows tournent sur l'**ancienne**
génération (`origin/dev/1.17.10`, `src/framework/modules/myapps`) puis sur la **nouvelle** (`origin/feat/navigation`,
`src/modules/myapps`). Fiche : `docs/migrations/myapps.md` sur `origin/feat/navigation`.

## Installer Maestro

- macOS / Linux : `curl -fsSL "https://get.maestro.mobile.dev" | bash`
- Windows (natif, sans WSL) : dézipper `maestro.zip` (releases GitHub), puis `setx PATH "%PATH%;C:\maestro\bin"`.
- Java 17 ou plus, `JAVA_HOME` défini. Vérifier : `maestro --help`.

## Préparer l'app

Maestro pilote une app **déjà installée** sur un émulateur Android ou un simulateur iOS démarré : build Debug et
Metro lancés comme d'habitude (skills `build-app` et `simulator` du dépôt mobile).

| Variable | Valeur | Où la trouver |
|---|---|---|
| `APP_ID` | identifiant du paquet | `override.json` : clé `appid` (Android), `appid.ios` (iOS). Dépend de l'override, ne pas deviner |
| `PLATFORM_NAME` | `name` de la plateforme de recette | config de marque de l'override (liste `platforms`). Inutile si la marque n'a qu'une plateforme |
| `LOGIN`, `PASSWORD` | compte de recette | à la main, par `-e` |
| `APP_TESTID` | carte d'une appli affichée sur le compte | `myapps-<name de l'appli ENT en kebab-case>`, ex. `Blog` → `myapps-blog` (flow 04) |
| `APP_WEB_TESTID` | carte d'une appli **sans module mobile** (web, connecteur) | même forme (flow 03) |

Vérifier `APP_ID` : `adb shell pm list packages` (Android), `xcrun simctl listapps booted | grep CFBundleIdentifier` (iOS).

## Lancer

Depuis `.maestro/`, un flow à la fois, dans cet ordre :

```bash
maestro test \
  -e APP_ID=<appid> -e PLATFORM_NAME=<name> -e LOGIN=<login> -e PASSWORD=<mot de passe> \
  -e APP_TESTID=myapps-<appli> -e APP_WEB_TESTID=myapps-<appli web> \
  flows/00-connexion.yaml
```

| Ordre | Flow | Comportement | Variables en plus |
|---|---|---|---|
| 0 | `flows/00-connexion.yaml` | connexion (sous-flow, lançable seul) | — |
| 1 | `flows/myapps-01-liste.yaml` | liste affichée, tirer-pour-rafraîchir | — |
| 2 | `flows/myapps-02-filtres.yaml` | les six filtres | — |
| 3 | `flows/myapps-06-onboarding.yaml` | onboarding : auto, une fois par session, cloche | — |
| 4 | `flows/myapps-05-menu.yaml` | menu « ⋯ », interrupteur, entrée de la modale des favoris | — |
| 5 | `flows/myapps-03-ouverture-appli.yaml` | appli web : confirmation du navigateur | `APP_WEB_TESTID` |
| 6 | `flows/myapps-04-favori-appui-long.yaml` | appui long, ajout / retrait d'un favori | `APP_TESTID` |

Ordre du plus sûr au plus dépendant du compte. Chaque flow est autonome : il remet l'app à zéro (`clearState`) et se
reconnecte. `maestro test flows/` lance les sept d'un coup (les sous-flows de `flows/communs/` sont ignorés : seul
le premier niveau d'un dossier est exécuté).

## Captures : référence sur l'ancienne, rejeu sur la nouvelle

1. **Ancienne génération** installée. Lancer chaque flow avec un dossier de sortie :
   `maestro test --test-output-dir captures/ancienne -e … flows/myapps-01-liste.yaml`
2. Rassembler les PNG dans un dossier de références :
   `mkdir -p references && find captures/ancienne -name "myapps-*.png" -exec cp {} references/ \;`
3. **Nouvelle génération** installée (même `APP_ID` si même override : l'une remplace l'autre). Rejouer en comparant :
   `maestro test --test-output-dir captures/nouvelle -e COMPARER=true -e REF_DIR=<chemin ABSOLU de references, avec des />  -e SEUIL=90 -e … flows/myapps-01-liste.yaml`

Sans `COMPARER=true`, les flows capturent sans comparer. `SEUIL` = pourcentage de ressemblance exigé (95 par défaut).
Même appareil, même OS, même langue (français), même compte pour les deux passes.

## Limites connues

- **iOS physique non supporté** : simulateurs seulement (et macOS). Android : émulateur ou appareil.
- **Écrans dynamiques** : la liste dépend du compte, l'onglet actif et les icônes distantes aussi. La comparaison
  est en plein écran avec un seuil global : une différence petite en surface (une étoile, un libellé) peut passer,
  une différence large mais attendue peut échouer.
- **Différences visuelles attendues entre générations**, à ne pas prendre pour des régressions : barre d'onglets
  (la nouvelle génération charge des modules de test à la place de Nouveautés, Messagerie…), header natif, feuilles
  du menu et des actions (`@gorhom/bottom-sheet` → `formSheet` native), carte de l'onboarding (refaite). Pour une
  première passe, baisser `SEUIL` ou comparer les PNG à l'œil.
- **Textes en français** : six sélecteurs sont des textes affichés (alerte native, toast, libellés), listés dans
  `selecteurs.md`. Appareil en français obligatoire.
- **Mot de passe sur simulateur iOS** : `inputText` peut échouer sur un champ sécurisé (remplissage automatique
  d'iOS). Parade : Réglages → Mots de passe → Options → désactiver le remplissage automatique.
- **`hideKeyboard` est instable sur iOS** : s'il laisse le clavier, le remplacer dans `00-connexion.yaml` par un
  appui sur une zone neutre de l'écran.
- **Connexion** : formulaire identifiant / mot de passe seulement (pas WAYF, pas de redirection) ; compte sans
  vérification d'e-mail / de mobile ni changement de mot de passe en attente.
- **Non couverts** (raisons dans l'en-tête des flows et dans `selecteurs.md`) : recherche, sélection et validation
  dans la modale des favoris, effet de l'interrupteur sur la liste, ouverture d'une appli à module, lien d'aide,
  « accès par le navigateur ».

## Non vérifié

Rien de ce qui suit n'a pu être confirmé sans lancer l'app ou Maestro.

**Parcours de connexion**
- Ordre réel des écrans : accueil → (choix de plateforme) → formulaire → onglets, déduit du code de navigation.
- Pop-ups système : la doc dit que `launchApp` accorde toutes les permissions par défaut ; à confirmer pour les
  notifications (Android 13+, iOS). Le dialogue « 16 KB page size » des images Android 16 n'est pas géré.
- Revalidation des CGU : traitée par un appui optionnel sur le texte « Accepter » ; jamais vue tourner.
- Nouvelle génération : le chargement des applis bloque la connexion. Si `GET /api/me/applications` échoue sur la
  recette, `00-connexion.yaml` échoue à l'attente de `tabbar-myapps` : c'est un signal, pas une instabilité.
- `clearKeychain` (iOS) sur Android : supposé ignoré.

**Données du compte de recette**
- Qu'il a au moins une appli affichée, et une appli sans module mobile avec un `testID` non vide dans l'ancienne
  génération (elle laisse le `testID` vide pour une appli sans config `/myApps/config`).
- Ses favoris de départ. `myapps-04` remet l'appli testée hors favoris au début et à la fin.

**Sélecteurs et rendu natif**
- Que chaque `testID` ressort bien dans l'arbre d'accessibilité : boutons du header (éléments natifs sur iOS),
  contenu d'une `formSheet` native sur Android, bouton d'onglet, `header-title` sur iOS (posé par du natif).
- Correspondance des `id` et des textes : regex, c'est documenté ; ancrée ou partielle, sensible à la casse ou non,
  ce ne l'est pas (les boutons d'alerte Android peuvent s'afficher en majuscules).
- La regex « au moins une carte » (`myapps-(?!filter-|…).+`) suppose le lookahead accepté par le moteur de Maestro.
- Fermeture d'une feuille par glissement vers le bas (`myapps-05`), retour au début de la barre de filtres par
  glissement (`myapps-02`), appui long de 3 s (durée fixe de Maestro) sur une carte.
- Le toast de succès recouvre peut-être la barre de filtres : `myapps-04` attend sa disparition par son texte.

**Maestro**
- `appId: ${APP_ID}` dans l'en-tête et « `when: visible` teste tout de suite, sans attendre » : réponses de
  l'assistant de la doc, pas d'une page de référence.
- Chemin des `runFlow` : supposé relatif au fichier appelant. S'il est relatif au dossier courant, lancer depuis `flows/`.
- `optional: true` sur `extendedWaitUntil` : la doc le décrit pour toute commande, sans exemple sur celle-ci.
- Une variable non passée vaut `undefined` sans erreur (dit pour `takeScreenshot` seulement) : `capture.yaml` en dépend.
- `assertScreenshot` : où se résout un chemin relatif n'est pas documenté (d'où `REF_DIR` absolu) ; l'arborescence
  exacte sous `--test-output-dir` non plus (d'où le `find`) ; un `thresholdPercentage` venu de `-e` est une chaîne,
  convertie par `Number(…)`.

## Documentation lue (docs.maestro.dev, 2026-11-18)

| Sujet | Page |
|---|---|
| `launchApp` (`clearState`, `clearKeychain`, permissions) | https://docs.maestro.dev/api-reference/commands/launchapp |
| `tapOn` | https://docs.maestro.dev/api-reference/commands/tapon |
| Sélecteurs (`id`, `text`, regex, `enabled`) | https://docs.maestro.dev/reference/selectors/core-selectors.md · https://docs.maestro.dev/maestro-flows/flow-control-and-logic/how-to-use-selectors |
| `testID` React Native → `id` | https://docs.maestro.dev/get-started/supported-platform/react-native |
| `runFlow` (`file`, `env`, `commands`) | https://docs.maestro.dev/api-reference/commands/runflow |
| Conditions (`when: visible / notVisible / true`) | https://docs.maestro.dev/maestro-flows/flow-control-and-logic/conditions |
| `extendedWaitUntil` | https://docs.maestro.dev/api-reference/commands/extendedwaituntil |
| `assertScreenshot` | https://docs.maestro.dev/api-reference/commands/assertscreenshot |
| `takeScreenshot` | https://docs.maestro.dev/api-reference/commands/takescreenshot |
| Variables `${VAR}`, `-e`, `env` | https://docs.maestro.dev/maestro-flows/flow-control-and-logic/parameters-and-constants |
| `optional`, `label` | https://docs.maestro.dev/maestro-flows/flow-control-and-logic/labeling-and-error-handling.md |
| Tags, découverte des flows | https://docs.maestro.dev/maestro-flows/workspace-management/test-discovery-and-tags.md |
| Config de workspace (`config.yaml`, non utilisée ici) | https://docs.maestro.dev/reference/workspace-configuration.md |
| Options de `maestro test` | https://docs.maestro.dev/maestro-cli/maestro-cli-commands-and-options.md |
| `inputText` | https://docs.maestro.dev/reference/commands-available/inputtext.md |
| `longPressOn` | https://docs.maestro.dev/reference/commands-available/longpresson.md |
| `assertVisible` / `assertNotVisible` | https://docs.maestro.dev/reference/commands-available/assertvisible.md · https://docs.maestro.dev/reference/commands-available/assertnotvisible.md |
| `scrollUntilVisible` | https://docs.maestro.dev/reference/commands-available/scrolluntilvisible.md |
| `swipe` | https://docs.maestro.dev/reference/commands-available/swipe.md |
| `hideKeyboard` | https://docs.maestro.dev/reference/commands-available/hidekeyboard.md |
| `waitForAnimationToEnd` | https://docs.maestro.dev/reference/commands-available/waitforanimationtoend.md |
| Installation | https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli |
| Problèmes connus, FAQ (iOS physique) | https://docs.maestro.dev/extra-materials/troubleshooting/known-issues.md · https://docs.maestro.dev/extra-materials/troubleshooting/faq.md |
