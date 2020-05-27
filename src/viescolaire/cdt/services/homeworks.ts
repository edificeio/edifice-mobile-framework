import { IHomeworkListState } from "../state/homeworks";
import moment from "moment";
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";

// Data type of what is given by the backend.
export type IHomeworkListBackend = {
  number: string;
  results: {
    id: string;
    date: long;
    type: string;
    subject: string;
    completed: boolean;
  }[];
  status: string;
};

const homeworkListAdapter: (data: IHomeworkListBackend) => IHomeworkListState = data => {
  let result = [] as IHomeworkListState;
  if (!data) return result;
  result = data.results.map(item => ({
    id: item.id,
    date: moment(item.date),
    type: item.type,
    subject: item.subject,
    completed: item.completed,
  }));
  return result;
};

export const homeworkListService = {
  get: async () => {
    const rawData = [
      { id: "1", date: moment(), subject: "Mathématiques", type: "Controle", completed: true },
      { id: "2", date: moment(), subject: "Science de la Vie & De La Terre ", type: "Exercice Maison", completed: false },
    ];
    // const data = notificationListAdapter(await fetchJSONWithCache(`/timeline/lastNotifications?page=0${appParams}`));
    const data = homeworkListAdapter(rawData);
    return data;
  },
};