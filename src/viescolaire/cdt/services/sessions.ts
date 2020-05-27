import { ISessionListState } from "../state/sessions";
import moment from "moment";
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";

// Data type of what is given by the backend.
export type ISessionListBackend = {
  number: string;
  results: {
    id: string;
    date: long;
    matiere: string;
    subject: string;
  }[];
  status: string;
};

const sessionListAdapter: (data: ISessionListBackend) => ISessionListState = data => {
  let result = [] as ISessionListState;
  if (!data) return result;
  result = data.results.map(item => ({
    id: item.id,
    date: moment(item.date),
    subject: item.subject,
    matiere: item.matiere,
  }));
  return result;
};

export const sessionListService = {
  get: async () => {
    const rawData = [
      { id: "1", date: moment(), matiere: "Mathématiques", subject: "Controle" },
      { id: "2", date: moment(), matiere: "Science de la Vie & De La Terre ", subject: "Exercice Maison" },
    ];

    // const data = notificationListAdapter(await fetchJSONWithCache(`/timeline/lastNotifications?page=0${appParams}`));
    const data = sessionListAdapter(rawData);
    return data;
  },
};
