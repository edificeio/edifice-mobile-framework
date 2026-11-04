# Journal des sessions

Entrées les plus récentes **en tête**. Une entrée par session, même courte. Format :

```
## AAAA-MM-JJ — <sujet> (<branche>)
- Fait :
- Décidé :
- En suspens :
- Prochaine étape :
```

---

## 2026-11-04 — Revue du suivi par l'utilisateur (`feat/ia/vmou`)

- Décidé :
  - **reportés** : notifications (ouverture, redirection), intents, modal / FormSheet « as promise ». Ils ont leur propre section dans [STATUS.md](STATUS.md) ;
  - `framework/util/media-deprecated` sera supprimé entièrement, au profit de `src/modules/media` ;
  - la série `docs-temp/auth/` est abandonnée ; la doc auth sera écrite dans `docs/` ;
  - le TODO du transport (refresh impossible → `logout`) devient une tâche indépendante ;
  - terminologie : « requirements », jamais « prérequis ».
- Corrigé : `audience` n'est **pas** migré (seule la partie issue de `auth` l'est) ; il passe dans les modules anciens.
- Ajouté : une section « Questions ouvertes » dans STATUS ; une section « Ancienneté de conception à corriger au passage » dans le gabarit et dans [myapps.md](myapps.md) (§4, dont un bug sur la version de l'onboarding). Dans `myapps`, les intents sont sortis du périmètre et ses questions passent en §8.
- Prochaine étape : trancher les questions d'architecture 2 et 3 de STATUS, et celles de [myapps.md](myapps.md) §8.

## 2026-11-04 — Mise en place du suivi + spec `myapps` (`feat/ia/vmou`)

- Fait : création de `docs/migrations/` (README avec protocole inter-sessions, STATUS, JOURNAL, gabarit) ; fiches `auth` et `media` reprises des notes des sessions d'octobre ; spécification de `myapps` (inventaire de l'ancien module, consommateurs, comportements à conserver, cible, plan en 8 phases).
- Constaté : l'app ne charge plus aucun module ancien (`AllModules()` renvoie `[]`) ; `useAppTheme` renvoie donc toujours le thème par défaut ; `src/modules/myapps/service.ts` ne compile pas ; `framework/modules/timeline/index.tsx` utilise une API `EntModule` obsolète ; la série `docs-temp/auth/` n'est pas dans ce checkout.
- Décidé : rien côté code. Organisation du suivi : voir [README.md](README.md).
- En suspens : les 6 questions ouvertes de [myapps.md](myapps.md) §7.
- Prochaine étape : trancher ces questions, puis phase 0 / 1 de `myapps`.

## 2026-10-29 — Migration `media` (reconstitué)

- Fait : module `src/modules/media` (carrousel, PDF, téléchargement, composants signés), façades `@deprecated`. Détail : [media.md](media.md).

## 2026-10-26 → 2026-10-27 — Modèle cible `auth` (reconstitué)

- Fait : champ `startup`, transport (`accountFetch`, refresh unique, annulation par session), cycle de session des modules (`sessionSetup`, `onSessionStart`, `onSessionRelease`), notifications par session, `createAuthFlows` / `useAuthFlows`. Détail : [auth.md](auth.md).

## Octobre 2026 — Migration `auth` phases 1 à 6 (reconstitué)

- Fait : stores zustand, sign-in, requirements, templates publics, façades `@deprecated`, tests Jest (stores, persistance, navigation du sign-in).
