import moment from "moment";

import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { IPeriodsList } from "../state/periods";

export type IPeriodsBackend = {
  timestamp_dt: string;
  timestamp_fn: string;
  ordre: number;
}[];

const periodsListAdapter: (data: IPeriodsBackend) => IPeriodsList = data => {
  return data.map(p => ({
    start_date: moment(p.timestamp_dt),
    end_date: moment(p.timestamp_fn),
    order: p.ordre,
  }));
};

export const periodsListService = {
  get: async (structureId: string, groupId: string) => {
    const periods: any[] = await fetchJSONWithCache(
      `/viescolaire/periodes?idGroupe=${groupId}&idEtablissement=${structureId}`
    );
    const data: IPeriodsList = periodsListAdapter(periods);

    return data;
  },
};
