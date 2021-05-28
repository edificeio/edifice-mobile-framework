/* eslint-disable flowtype/no-types-missing-file-annotation */
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { IMoyenneList } from "../state/moyennes";

export type IMoyenneListBackend = {
  number: string;
  results: {
    matiere: string;
    note: number;
    total: number;
    teacher: string;
    moySousMatiere?: { matiere: string; note: number; total: number }[];
  }[];
  status: string;
};

const moyenneListAdapter: (data: IMoyenneListBackend) => IMoyenneList = data => {
  let result = [] as IMoyenneList;
  if (!data) return result;
  result = data.results.map(item => ({
    matiere: item.matiere,
    note: item.note,
    total: item.total,
    teacher: item.teacher,
    moySousMatiere: item.hasOwnProperty("moySousMatiere") ? item.moySousMatiere : [],
  }));
  return result;
};

export const moyenneListService = {
  get: async () => {
    const rawData = {
      number: "1",
      results: [
        {
          teacher: "Korosensei",
          matiere: "Mathématiques",
          note: 15,
          total: 20,
        },
        {
          teacher: "Korosensei",
          matiere: "Histoire-Géographie",
          note: 10,
          total: 20,
          moySousMatiere: [
            { matiere: "Geographie", note: 5, total: 20 },
            { matiere: "Histoire", note: 15, total: 20 },
          ],
        },
        {
          teacher: "Korosensei",
          matiere: "Mathématiques",
          note: 18,
          total: 20,
        },
      ],
      status: "OK",
    };
    // const data = notificationListAdapter(await fetchJSONWithCache(`/timeline/lastNotifications?page=0${appParams}`));
    const data = moyenneListAdapter(rawData);
    return data;
  },
};
