import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { IQuota } from "../state/quota";

// Data type of what is given by the backend.
export type QuotaBackend = {
  storage: number;
  quota: string;
};

const quotaAdapter: (data: QuotaBackend) => IQuota = data => {
  return {
    storage: data.storage,
    quota: data.quota,
  };
};

export const quotaService = {
  get: async () => {
    const data = quotaAdapter(await fetchJSONWithCache(`/zimbra/quota`));
    return quotaAdapter(data);
  },
};
