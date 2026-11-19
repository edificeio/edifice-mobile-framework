# Tests de fumée Maestro

> Des tests lancés par les développeurs, qui prouvent un module dans l'app **avant et après** sa migration ([.claude/skills/migrate-module/INTENT.md](../.claude/skills/migrate-module/INTENT.md)). Les tests E2E complets restent ceux de l'équipe QA, sur son outillage.
>
> **État au 2026-11-19 : les flows fournis ont été écrits à partir du code, aucun n'a encore tourné.** Ce document dit comment les démarrer, les corriger, puis en écrire pour le module suivant.

## Les règles

- **Compte de recette uniquement**, sur une plateforme de recette. L'app traite des données d'élèves mineurs.
- **Le dépôt est public** : aucun identifiant, mot de passe, nom de plateforme ni identifiant d'application dans un fichier. Tout passe par `-e`.
- Les captures d'écran montrent un compte : `.maestro/captures/` et `.maestro/references/` sont ignorés par git.
- Android (émulateur ou téléphone) et simulateur iOS. **Un iPhone physique n'est pas supporté par Maestro.**

## Ce qu'il y a ici

```
.maestro/
  README.md               ce guide
  myapps.md               flows de myapps : variables, ordre, limites, points non vérifiés
  selecteurs.md           testID par flow, écarts entre générations, testID manquants
  flows/
    00-connexion.yaml     connexion ; appelé par tous les autres, lançable seul
    myapps-01-liste.yaml … myapps-06-onboarding.yaml
    communs/              sous-flows, jamais lancés seuls
```

| Variable | Valeur | Où la trouver |
| --- | --- | --- |
| `APP_ID` | identifiant du paquet | `override.json`, clé `appid` (Android) ou `appid.ios` ; vérifier par `adb shell pm list packages` |
| `PLATFORM_NAME` | `name` de la plateforme de recette | configuration de marque de l'override ; inutile si la marque n'a qu'une plateforme |
| `LOGIN`, `PASSWORD` | compte de recette | à la main, dans le terminal |

## Deux builds, un seul jeu de flows

Sur `feat/navigation`, l'app ne charge que les modules migrés : **le flow d'un module pas encore migré ne peut pas y passer**. Les flows se jouent donc sur deux builds :

| Passe | App installée | Ce qu'elle prouve |
| --- | --- | --- |
| **Référence** | l'ancienne génération : un build de recette déjà distribué, ou un build de la branche de développement | le flow décrit bien le comportement actuel |
| **Après** | le build de `feat/navigation` | la migration a conservé ce comportement |

Maestro pilote n'importe quelle app installée ; le flow et l'app n'ont pas besoin de venir de la même branche. Si les deux builds ont le même identifiant, l'un remplace l'autre sur l'appareil.

## Démarrer, pas à pas

On s'arrête où on en est ; chaque étape a son critère.

| # | Étape | Commande ou geste | Fini quand |
| --- | --- | --- | --- |
| 1 | Installer | `curl -fsSL "https://get.maestro.mobile.dev" \| bash` ; Java 17 ou plus | `maestro --help` répond |
| 2 | Préparer l'appareil | émulateur Android lancé, ou téléphone en débogage USB. Commencer par Android : sur simulateur iOS, la saisie du mot de passe échoue souvent | `adb devices` liste un seul appareil |
| 3 | Installer l'app de référence | le build de l'ancienne génération ; appareil en français | on s'y connecte à la main avec le compte de recette |
| 4 | Poser les variables | `export APP_ID=… PLATFORM_NAME=… LOGIN=… PASSWORD=…` dans le terminal | `echo $APP_ID` répond |
| 5 | Lancer la connexion seule | `maestro test -e APP_ID=$APP_ID -e PLATFORM_NAME=$PLATFORM_NAME -e LOGIN=$LOGIN -e PASSWORD=$PASSWORD .maestro/flows/00-connexion.yaml` | la barre d'onglets est atteinte, **deux fois de suite** |
| 6 | Lancer un flow de module | même commande avec `.maestro/flows/myapps-01-liste.yaml` | vert deux fois de suite |
| 7 | Passe « après » | installer le build de `feat/navigation`, rejouer 5 et 6 | ce qui casse est noté dans la fiche du module |
| 8 | Les autres flows de `myapps` | un par un, dans l'ordre de [myapps.md](myapps.md), d'abord sur la référence | chacun vert deux fois, ou marqué « à corriger » avec la raison |

`yarn e2e` lance toute la suite avec les variables du terminal.

L'étape 5 est celle qui coûte : compter 15 à 20 minutes d'ajustement. Si elle ne passe pas en 30 minutes, s'arrêter et noter où elle bute.

**Sur un téléphone** : Android branché en USB ; `scrcpy` affiche son écran sur le poste. Un build de recette (sans Metro) est plus stable qu'un build Debug ; avec un Debug, `adb reverse tcp:8081 tcp:8081` et Metro lancé. Si un émulateur est ouvert en même temps, préciser l'appareil à Maestro (`maestro --help`).

## Corriger et vérifier un flow

### Lire un échec

Maestro s'arrête à la première commande qui échoue et la nomme. Trois causes couvrent presque tout :

| Symptôme | Cause probable | Geste |
| --- | --- | --- |
| un `id` n'est pas trouvé alors que l'élément est à l'écran | le `testID` n'est pas exposé à cet endroit, ou il a changé | `maestro studio` : inspecter l'écran et lire l'identifiant réel ; corriger le flow, ou ajouter le `testID` au code ([selecteurs.md](selecteurs.md) §3) |
| l'élément n'est pas encore là | chargement, animation, bundle Metro | `extendedWaitUntil` avec un `timeout` à la place d'`assertVisible` ; jamais d'attente fixe |
| un écran imprévu s'intercale | pop-up système, CGU, onboarding, clavier resté ouvert | un bloc `runFlow` conditionnel (`when: visible`) qui le ferme, comme dans `00-connexion.yaml` |

### Les points fragiles déjà connus

La liste complète est dans [myapps.md](myapps.md), section « Non vérifié ». Les premiers à regarder :

- l'écran des CGU : le bouton « Accepter » n'a pas de `testID`, le flow s'appuie sur son texte ;
- `hideKeyboard` et la saisie du mot de passe sur iOS ;
- les chemins des sous-flows (`runFlow: communs/…`) : s'ils ne se résolvent pas, lancer depuis `.maestro/flows/` ;
- l'expression « au moins une carte d'appli » de `myapps-01`, dont la syntaxe est à confirmer ;
- sur `feat/navigation`, le chargement des applis bloque la connexion : s'il échoue, `00-connexion` échoue. C'est un signal sur l'app, pas une instabilité du test.

### Dire qu'un flow est bon

1. Il passe deux fois de suite sur la référence, sans intervention.
2. **Il échoue quand on casse le comportement** : masquer un bouton ou changer un `testID` à la main, et constater qu'il rougit. Un flow qui ne peut pas échouer ne prouve rien.
3. Il n'a aucune attente fixe et, autant que possible, aucun sélecteur par texte.
4. S'il écrit sur le compte (favoris), il le remet dans l'état de départ.

Un flow qui passe une fois sur trois n'entre pas dans la suite : il se corrige ou il sort.

## Écrire les flows d'un module à migrer

**Avant de toucher au module** : c'est le premier pas de sa bascule ([.claude/skills/migrate-module/BASCULE.md](../.claude/skills/migrate-module/BASCULE.md)).

| # | Étape | Détail |
| --- | --- | --- |
| 1 | Lister les comportements à conserver | cinq à huit, dans la fiche du module : l'entrée dans le module, l'écran principal avec ses données, une action qui écrit, un écran vide ou une erreur, le retour arrière |
| 2 | Inventorier les `testID` | `git grep -n "testID" -- src/framework/modules/<module>` ; ce qui manque se note dans [selecteurs.md](selecteurs.md) |
| 3 | Ajouter les `testID` manquants **sur l'ancienne génération** | changement à part, sans rien d'autre ; la bascule les conserve |
| 4 | Écrire un flow par comportement | `<module>-NN-<comportement>.yaml` ; en tête, en commentaire, le comportement visé et la section de la fiche ; il commence par `runFlow: 00-connexion.yaml` |
| 5 | Faire passer sur la référence | deux fois de suite, puis le casser pour vérifier qu'il échoue |
| 6 | Basculer le module | selon le patron |
| 7 | Rejouer sur le build de `feat/navigation` | vert : le comportement est conservé. Rouge : régression, ou écart voulu à écrire dans la fiche |

Règles d'écriture :

- **un flow, un comportement** : un flow qui en teste trois ne dit pas lequel a cassé ;
- **sélecteur par `testID`** ; un repli sur un texte se signale comme fragile (langue, données du compte) ;
- **autonome** : chaque flow repart d'une app remise à zéro et se reconnecte ;
- **aucune donnée précise du compte** sans la passer en variable ;
- le nom du fichier commence par le nom du module : c'est ce que compte `yarn migration-status` ;
- un flow écrit par l'agent est relu par le développeur et **validé par son exécution sur l'appareil**, jamais par l'agent seul.

Demande type à l'agent :

```
Écris les flows Maestro du module <module>, avant sa migration.

Lis sa fiche dans .claude/skills/migrate-module/journal/ (comportements à conserver), le code de
src/framework/modules/<module>, et les flows de .maestro/flows/ pour la forme.

1. Propose 5 à 8 comportements à couvrir, un par flow. Attends ma validation.
2. Inventorie les testID du module ; liste ceux qui manquent, avec fichier, ligne et nom proposé.
   N'en ajoute aucun sans mon accord.
3. Écris un flow par comportement dans .maestro/flows/, et complète .maestro/selecteurs.md.

Tu ne peux pas lancer l'app : ne dis d'aucun flow qu'il passe. Termine par ce que je dois
vérifier sur l'appareil, flow par flow, et la commande pour lancer chacun.
```

## Ce que cette suite ne couvre pas

- La CI : à envisager quand la suite est stable sur deux modules.
- La comparaison de captures d'écran ([myapps.md](myapps.md) en décrit le principe) : utile contre les régressions visuelles, à calibrer.
- Les parcours qui sortent de l'app (navigateur, liens d'aide) et les connexions par fédération d'identité.
- La logique pure : elle reste sous Jest (`yarn test`).
