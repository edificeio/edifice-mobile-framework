/**
 * Homework Dummy Data
 * Just data. Use this whenever you want.
 */

import moment from "moment";
import "moment/locale/fr";
import { IDiaryArray, IDiaryDayTasks } from "./reducers/diaries";
moment.locale("fr");

export const thisWeek: IDiaryDayTasks[] = [
  {
    moment: moment(),
    tasks: {
      1: {
        description:
          "Réviser le Traitement Automatique du Langage Naturel et beaucoup beaucoup beaucoup et encore beaucoup de texte franchement c'est trop là",
        id: 1,
        title: "Intelligence Artificielle"
      },
      2: {
        description: "Conjuguer Bouillir au subjonctif pluriel",
        id: 2,
        title: "Tristitude"
      },
      3: {
        description:
          "Dissertation : Quel avenir pour les pingouins d'Afrique ?",
        id: 3,
        title: "Philosophie"
      }
    }
  },
  {
    moment: moment().add({ days: 1 }),
    tasks: {
      4: {
        description: "Sculpter la Venus de Milo avec des bras",
        id: 4,
        title: "Scuplture sur marbre"
      },
      5: {
        description: "Photocopier du sable et éventer la famille pirate",
        id: 5,
        title: "Kamoulox"
      }
    }
  },
  {
    moment: moment().add({ days: 2 }),
    tasks: {
      6: {
        description: "Réciter l'alphabet cyrillique à l'envers",
        id: 6,
        title: "Russe"
      },
      7: {
        description: "Exo 15 → 88 p. 249 et plus ou moins",
        id: 7,
        title: "Physique - Chimie"
      },
      8: {
        description:
          "Dissertation : Quel avenir pour les dissertations sur les pingouins d'Afrique ?",
        id: 8,
        title: "Philosophie"
      }
    }
  }
];

export const allDiaries: IDiaryArray = {
  "ceci-est-un-id": {
    id: "ceci-est-un-id",
    tasksByDay: thisWeek
  }
};

// FIXME : Sometime we have to kill tsc process and re-run it, otherwise JS can't find imported fetchDummyData...

export async function fetchDummyData(start: number, count: number) {
  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  try {
    await timeout(2000); // sleep for 2 seconds.
    return allDiaries;
  } catch (err) {
    throw err;
  }
}
