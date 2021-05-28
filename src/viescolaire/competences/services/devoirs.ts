/* eslint-disable flowtype/no-types-missing-file-annotation */
import moment from "moment";

import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { IDevoirList } from "../state/devoirs";

// Data type of what is given by the backend.
export type IDevoirListBackend = {
  number: string;
  results: {
    id: string;
    date: string;
    teacher: string;
    subject: string;
    matiere: string;
    note: number;
    total: number;
    coefficient: number;
    competences?: { label: string; note: number }[];
  }[];
  status: string;
};

const devoirListAdapter: (data: IDevoirListBackend) => IDevoirList = data => {
  let result = [] as IDevoirList;
  if (!data) return result;
  result = data.results.map(item => ({
    id: item.id,
    date: moment(item.date),
    teacher: item.teacher,
    subject: item.subject,
    matiere: item.matiere,
    note: item.note,
    total: item.total,
    coefficient: item.coefficient,
    competences: item.hasOwnProperty("competences") ? item.competences : [],
  }));
  return result;
};

export const devoirListService = {
  get: async () => {
    const rawData = {
      number: "1",
      results: [
        {
          id: "1",
          date: "23/03/2020",
          teacher: "Korosensei",
          subject: "Math Fraction",
          matiere: "Mathématiques",
          note: 15,
          total: 20,
          coefficient: 2,
        },
        {
          id: "2",
          date: "25/03/2020",
          teacher: "Korosensei",
          subject: "Geo Cote Est du Japon",
          matiere: "Histoire-Géographie",
          note: 10,
          total: 20,
          coefficient: 3,
          competences: [
            { label: "Sait colorier une carte", note: 0 },
            { label: "Connait les iles principales du Japon", note: 4 },
            { label: "Se souvient des activités principales de chaque poles", note: 3 },
          ],
        },
        {
          id: "3",
          date: "18/03/2020",
          teacher: "Korosensei",
          subject: "Math Integrale",
          matiere: "Mathématiques",
          note: 18,
          total: 20,
          coefficient: 4,
        },
      ],
      status: "OK",
    };
    // const data = notificationListAdapter(await fetchJSONWithCache(`/timeline/lastNotifications?page=0${appParams}`));
    const data = devoirListAdapter(rawData);
    return data;
  },
};
