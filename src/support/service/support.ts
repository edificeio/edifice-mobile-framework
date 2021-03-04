import { fetchJSONWithCache } from "../../infra/fetchWithCache";

export const supportService = {
  createTicket: async () => {
    await fetchJSONWithCache(`/support/ticket`, {
      method: "post",
    });
  },
};
