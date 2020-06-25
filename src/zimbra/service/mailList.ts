import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { IMailList } from "../state/mailList";

// Data type of what is given by the backend.
export type IMailListBackend = object;

const mailListAdapter: (data: IMailListBackend) => IMailList = data => {
  let result = [] as IMailList;
  if (!data) return result;
  result = data.map(item => ({}));
  return result;
};

export const mailListService = {
  get: async (apps: string[]) => {
    const data = mailListAdapter(await fetchJSONWithCache(``));
    return data;
  },
  post: async (apps: string[]) => {
    const data = await fetchJSONWithCache(``);
    return data;
  },
};
