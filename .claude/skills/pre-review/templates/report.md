# Pré-review PR #<n> — <titre>

**Auteur** : <login> · **Branche** : `<head>` → `<base>` · **Taille** : <fichiers> fichiers, +<add>/-<del> · **Commit** : `<headRefOid>`

**Titre** : <longueur> caractères / 100 max

**En bref** : <ce que fait la PR, en une phrase>

## Bloquant

### B1. <titre court du problème>

`src/…/screen.tsx:42`

<constat : ce qui ne va pas et ce que ça provoque, en une ou deux phrases>

```tsx
<extrait du code concerné, quelques lignes>
```

**Règle** : CONVENTIONS §9 i18n — <ce que la règle impose et pourquoi, en une phrase>.

**Piste** : <correction, en une phrase>

```tsx
<code corrigé, quand la correction tient en quelques lignes>
```

## À corriger

_Aucun retour._

## Mineur

### M1. <titre court du problème>

`src/…/file.ts:12`

<constat, en une ou deux phrases>

```ts
<extrait du code concerné, quelques lignes>
```

## Suggestions

### S1. <titre court de l'amélioration>

`src/…/file.ts:30`

<constat et amélioration proposée, en une ou deux phrases>

```ts
<extrait du code concerné, quelques lignes>
```

## Points à vérifier par le reviewer

### V1. <sujet à tester>

<pourquoi : lien avec la PR ou une remarque ci-dessus (ex. B1)>

- **Où** : <plateforme(s), profil (élève / parent / enseignant), écran et chemin pour y accéder, données nécessaires>
- **À faire** : <actions précises, dans l'ordre>
- **Attendu** : <ce qu'on doit voir quand c'est correct>
- **Anomalie** : <ce qu'on ne doit pas voir : symptôme d'une régression>

## Non vérifié

- `yarn ts-all` / `yarn lint-all` non lancés (pas de checkout).
- <fichiers non lus, faute de temps ou parce que générés>

---

<x> bloquants, <y> à corriger, <z> mineurs, <w> suggestions

**Verdict** : <Rejetée | À modifier | Approuvée> — <raison principale, en une phrase>
