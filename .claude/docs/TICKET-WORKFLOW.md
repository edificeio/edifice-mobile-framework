# TICKET-WORKFLOW.md

Déroulé d'un ticket, à destination des agents IA (référencé par `CLAUDE.md` §6).

S'applique dès qu'un développeur démarre le traitement d'un ticket (bug ou feature). Suis les étapes dans l'ordre, sans en sauter.

## 1. Brief

Le développeur fournit :

- les **specs** et le **contexte** du ticket (clé Jira incluse) ;
- les **fichiers utiles** à regarder ;
- les **critères d'acceptation** ou conditions qui définissent la fin de la tâche.

S'il manque l'un de ces éléments (en particulier les critères d'acceptation), **demande-le** avant de passer au plan. Demande aussi le profil utilisateur (élève, parent, enseignant) à utiliser pour le test.

## 2. Plan (mode plan)

Propose un plan que le développeur peut éditer : fichiers touchés, découpage en lots de petite taille, vérification de chaque lot, scénario de test sur simulateur (écrans à atteindre, actions, résultat attendu). **Pas de code avant validation du plan.**

## 3. Implémentation

Implémente le plan validé, lot par lot. Après chaque lot : `yarn ts-all` + `yarn lint-all`. Si le plan doit changer en cours de route, arrête-toi et demande.

## 4. Test sur simulateur Android

1. **Demande au développeur s'il veut lancer le build.** S'il accepte, suis le skill `build-app` : le build doit passer **sans erreur**. S'il refuse, arrête-toi là et passe au compte rendu (test non effectué).
2. Lance-la sur un simulateur Android (skill `simulator`, argument `android`).
3. Déroule le scénario de test du plan : naviguer dans l'application, afficher les bons écrans, effectuer les actions, vérifier le résultat attendu.

## 5. Test sur simulateur iOS

Idem étape 4 avec le skill `simulator`, argument `ios`.

## Compte rendu

- Pour chaque plateforme, indique : build OK/KO, scénario déroulé ou non, résultat observé pour chaque critère d'acceptation.
- **Si tu n'as pas pu builder, lancer le simulateur ou dérouler une action** (skill manquant ou vide, login impossible, élément introuvable…), **dis-le explicitement** et précise où tu t'es arrêté. Ne présente jamais un test comme réussi sans l'avoir effectivement déroulé.
