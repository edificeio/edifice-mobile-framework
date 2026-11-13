---
paths:
  - "package.json"
---

# Règles générales

Toutes les dépendances référencées dans le fichier `package.json` (racine du projet) le sont avec un numéro de version exact (pas de ^ ni de ~).

Certaines versions de dépendances sont aussi fixées dans la section `resolutions`, pour éviter les conflits de versions.

Minimise la quantité de dépendances générales du projet, si possible, préfère les dépendances de dev. Dans ce cas, les ajouter via la commande `yarn add-dev [package]` (c.f. `Ajouter une nouvelle dépendance de développement`).

# Ajouter une nouvelle dépendance à l'application (section `dependencies`)

Doit se faire obligatoirement via la commande `yarn add-dep [package]`.

# Ajouter une nouvelle dépendance de développement (section `dev`)

Doit se faire obligatoirement via la commande `yarn add-dev [package]`.