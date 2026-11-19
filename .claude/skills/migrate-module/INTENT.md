# Migration vers le nouveau système de modules : intention

> À lire avant tout le reste, par les humains comme par l'agent. Ce document dit **pourquoi** on migre, **ce qui** est dans la migration, **comment** on la mène et **quand** elle est finie. Il ne dit pas comment faire : les gestes sont dans [BASCULE.md](BASCULE.md) et dans les skills, les règles détaillées dans [CONVENTIONS.md](CONVENTIONS.md). L'état du moment est dans [SUIVI.md](journal/SUIVI.md) (calculé à partir du code) et [STATUS.md](journal/STATUS.md) (décisions, blocages, suite).

## 1. Le contexte

L'application mobile est une app React Native découpée en modules (blog, messagerie, vie scolaire, cahier de textes…), déclinée en plusieurs marques. Chaque module déclare ses écrans, son état et ses droits auprès d'un framework commun.

Deux générations de ce framework coexistent dans le code :

|                                    | Ancienne génération                                       | Nouvelle génération                                      |
| ---------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| Un module se déclare               | en deux fichiers, et s'enregistre lui-même à la connexion | en un seul, et figure dans une liste centrale de modules |
| La navigation est                  | construite à la volée, selon les droits, et peu typée     | déclarée à l'avance, et entièrement typée                |
| Les modales des modules            | vivent dans l'onglet courant                              | sont séparées des écrans                                 |
| Les données de session se chargent | par un mécanisme propre à chaque module                   | par des étapes communes du cycle de session              |

Le détail technique est dans [ARCHITECTURE.md](../../docs/ARCHITECTURE.md).

Les modules fonctionnels sont migrés **sur place**, dans leur dossier actuel : d'autres équipes les modifient pendant la migration, et un module qui ne bouge pas garde des conflits git faciles à résoudre.

## 2. Pourquoi on migre, et pourquoi d'un seul bloc

La montée de version de React Native et celle de react-navigation arrivent ensemble, et react-navigation apporte beaucoup de changements cassants. L'architecture des modules doit évoluer pour supporter les deux à la fois : l'ancienne navigation ne tient pas sur la nouvelle pile.

Conséquences :

- **la montée React Native ne peut pas être livrée seule** : `feat/rn86` attend la migration ;
- **`feat/navigation` est la branche de la migration** : elle sera mergée dans `feat/rn86`, puis l'ensemble dans la branche de développement ;
- **sur cette branche, l'app ne charge plus les modules anciens** : un module pas encore migré est absent de l'app. La migration se livre donc d'un seul bloc, quand tous les modules sont passés.

Ce choix a un coût : tant que la migration n'est pas finie, rien n'est livré, et le code ancien continue d'évoluer sur les branches d'équipe. D'où les règles de ce document : avancer par petits pas vérifiés, mesurer ce qui reste, ne rien embarquer d'autre.

## 3. Le résultat attendu

- Tous les modules sont sur la nouvelle génération, et l'ancien système (navigation, registre, façades de compatibilité) est supprimé.
- L'app tourne sur la nouvelle version de React Native, sur toutes les marques.
- **Pour les utilisateurs, la migration ne change rien** : mêmes écrans, mêmes parcours, mêmes données conservées sur l'appareil. Un changement visible (une correction de bug, par exemple) ne vient qu'avec l'assainissement, et seulement s'il a été validé.

## 4. La migration d'un module : deux étapes, deux skills

|                 | Étape 1 : la bascule                                                                                                   | Étape 2 : l'assainissement                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Skill           | `/migrate-module <chemin>` (ce skill)                                                                                  | `/sanitize-module <chemin> [sujet \| tous]`                                          |
| Ce qu'elle fait | le module change de génération ; son comportement et son code interne ne changent pas                                  | le code du module s'améliore, un sujet à la fois                                     |
| Pourquoi à part | pour que chaque bascule reste petite, relisible, et que la migration puisse se livrer d'un bloc                        | pour que chaque amélioration se relise et se teste seule, sans retarder la livraison |
| Qui             | l'agent applique le patron, le développeur tranche les rares décisions, relit et joue le parcours                      | le développeur choisit les sujets et décide ; l'agent analyse et propose             |
| Preuve          | rien de cassé, rien de changé : mêmes erreurs de compilation, mêmes identifiants de test, mêmes données, même parcours | celle d'un changement ordinaire : tests, relecture, parcours joué                    |
| Taille          | une PR par module                                                                                                      | une PR par sujet                                                                     |

Les deux étapes ne vont jamais dans la même PR. Une amélioration repérée pendant la bascule se note dans la fiche du module : c'est le backlog de l'assainissement.

**La migration, au sens de ce document, c'est l'étape 1 de tous les modules.** L'étape 2 peut continuer après la livraison.

### Ce qui va dans la bascule

Tout ce qui ne marche pas, ou plus, dans la nouvelle navigation, même si cela touche le code d'un écran. Le reste attend l'assainissement. La liste des gestes est dans [BASCULE.md](BASCULE.md).

### Ce qui va dans l'assainissement

Tout ce qui améliore le code sans être nécessaire au changement de génération : façon d'écrire les écrans, organisation du module, performance, styles, conversions d'interface, droits, erreurs et bugs déjà présents. La liste des sujets et leur ordre sont dans le skill [`sanitize-module`](../sanitize-module/SKILL.md).

### En profiter pour relever bugs et défauts de conception

La migration fait relire tout le code de l'app, module par module : c'est l'occasion de **relever chaque bug rencontré et chaque problème de conception**, même quand on ne le corrige pas tout de suite. Rien de ce qui a été vu ne doit se perdre :

- ce qui est **propre au module** va dans sa fiche, pour être corrigé pendant son assainissement ;
- ce qui **dépasse le module** (framework, autre module, choix de conception à trancher) ou qui ne peut pas être corrigé maintenant va dans [later.md](journal/later.md), en vue d'une correction future.

Relever n'est pas corriger : pendant la bascule, on note, on ne touche pas.

### Hors des deux étapes

- **Le passage de Redux à zustand** : un module garde son gestionnaire d'état (exception déjà décidée : `user`).
- Un changement d'API serveur.
- La version suivante de react-navigation.
- **Les widgets d'accueil** : faits à part par l'équipe, en dehors de la migration, car des développements sont en cours en parallèle.

### Ce que les deux étapes ne règlent pas

- **Les dépendances entre modules anciens.** Un module basculé peut utiliser le code d'un module ancien, mais ni naviguer vers lui ni lire son état : ce module n'est pas chargé. Ces dépendances donnent l'ordre de migration : d'abord les modules dont les autres dépendent.
- **Ce qui n'a pas encore d'équivalent dans le nouveau système** : ouverture des notifications, intents, liste des modules par marque. Ce sont des chantiers de conception, listés dans [STATUS.md](journal/STATUS.md) et [later.md](journal/later.md) ; aucune vitesse d'exécution ne les remplace. Pour ne pas bloquer les bascules, les gestionnaires de notifications restent débranchés jusqu'à ce que leur mécanisme existe, et sont rebranchés avant la livraison.
- **Le test complet d'un module isolé.** Une partie d'un module ne se joue parfois dans l'app qu'une fois d'autres modules migrés (ex. « Mes applis » ouvre des apps portées par des modules pas encore basculés).
- **Le temps humain.** Le coût d'un module est dans les décisions, la relecture et le test dans l'app, pas dans l'écriture.

## 5. Comment se comporter pendant la migration

Valable pour le développeur comme pour l'agent.

1. **Le test d'abord, si possible.** Un module a, avant sa bascule, des tests automatisés de ses parcours, ou à défaut une recette écrite dans sa fiche. On rejoue la même chose après.
2. **Un module à la fois.** Une bascule ne touche ni un autre module ni le framework. Si elle a besoin d'une évolution du framework, celle-ci part avant, à part.
3. **Porter, pas améliorer, mais tout noter.** Ce que la bascule n'exige pas attend l'assainissement. Un bug ou un défaut de conception rencontré se note toujours : dans la fiche du module, ou dans [later.md](journal/later.md) s'il dépasse le module.
4. **S'arrêter et demander** quand le module dépend d'un module ancien ou d'un mécanisme sans équivalent, quand il faut faire évoluer le framework, ou quand la bascule déborde du module. Les conditions précises sont dans [BASCULE.md](BASCULE.md).
5. **Ne jamais dire « ça marche » sans l'avoir vérifié.** Ce qui n'a pas été lancé, ou pas joué dans l'app, est écrit comme tel.
6. **Une décision se prend une fois.** Elle s'écrit dans [CONVENTIONS.md](CONVENTIONS.md) ou dans un skill, et ne se repose plus au module suivant.
7. **Le compteur ne remonte pas.** Aucun nouveau code ne s'écrit sur l'ancienne génération ; le suivi calculé le vérifie.
8. **Les identifiants de test et les données gardées sur l'appareil ne changent pas.** Ce sont eux qui rendent le test avant / après possible, pour nous comme pour l'équipe QA.

## 6. Mesurer : le suivi calculé

[SUIVI.md](journal/SUIVI.md) est une page générée à partir du code, jamais modifiée à la main. Pour chaque module, elle dit sur quelle génération il est, s'il reste de l'ancienne navigation, quels modules anciens il utilise encore, et s'il a des tests de parcours. En tête, quelques totaux qui doivent baisser : modules restants, écrans anciens, fichiers sur l'ancienne navigation.

On la recalcule à la fin de chaque session, et elle se commite avec le module : son historique donne la courbe d'avancement, et le nombre de modules basculés par semaine donne une date de fin.

`SUIVI.md` dit ce que le code contient ; [STATUS.md](journal/STATUS.md) dit ce qu'on a décidé, ce qui bloque et la suite. S'ils se contredisent, `SUIVI.md` a raison sur les faits. Le fonctionnement du script est décrit dans [SKILL.md](SKILL.md) (« Le suivi calculé »).

## 7. Terminé quand

**Un module** est basculé quand :

1. il ne contient plus rien de l'ancienne navigation ;
2. il ne dépend plus d'un module ancien que par du code, et chaque dépendance qui reste est justifiée dans sa fiche ;
3. il n'introduit aucune erreur de compilation ;
4. ses identifiants de test et ses données sur l'appareil sont inchangés ;
5. ses parcours se jouent dans l'app comme avant, ou sa fiche dit précisément ce qui n'a pas pu l'être, pourquoi, et ce qui le remplace.

Les vérifications précises sont dans [BASCULE.md](BASCULE.md) (« Vérifier »).

**La migration** est terminée quand tous les modules sont basculés, que `feat/navigation` est mergée dans `feat/rn86`, et que l'ensemble est en production.

## 8. Faire apprendre les skills

Les skills `migrate-module` et `sanitize-module` sont l'endroit où l'on capitalise. Après chaque module ou chaque session d'assainissement, quinze minutes :

| On regarde                                          | On en fait                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| les questions que l'agent a posées                  | une décision écrite, s'il la reposerait au module suivant                       |
| ce qui a cassé dans l'app alors que tout compilait  | un geste de [BASCULE.md](BASCULE.md), un critère de fin, ou un test de parcours |
| ce que le développeur a corrigé à la main           | une règle ou un exemple dans le skill                                           |
| le temps passé (lecture, décisions, écriture, test) | une ligne dans le journal : ce débit donne la date de fin                       |

## 9. Pour aller plus loin

| Document                                                               | Pour                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [BASCULE.md](BASCULE.md)                                               | faire une bascule : les gestes, les conditions d'arrêt, la vérification               |
| [CONVENTIONS.md](CONVENTIONS.md)                                       | les règles communes aux deux étapes                                                   |
| [SKILL.md](SKILL.md), [`sanitize-module`](../sanitize-module/SKILL.md) | le déroulé de chaque skill                                                            |
| [journal/](journal/README.md)                                          | le suivi : protocole des sessions, état, journal, sujets reportés, fiches des modules |
