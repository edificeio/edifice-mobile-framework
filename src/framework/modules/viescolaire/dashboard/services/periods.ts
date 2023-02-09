import moment from 'moment';

import { IPeriodsList, IYear } from '~/framework/modules/viescolaire/dashboard/state/periods';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

export type IPeriodsBackend = {
  timestamp_dt: string;
  timestamp_fn: string;
  ordre: number;
  type: number;
  id_type: number;
}[];

export type IYearBackend = {
  start_date: string;
  end_date: string;
};

const periodsListAdapter: (data: IPeriodsBackend) => IPeriodsList = data => {
  return data.map(p => ({
    start_date: moment(p.timestamp_dt),
    end_date: moment(p.timestamp_fn),
    order: p.ordre,
    type: p.type,
    id_type: p.id_type,
  }));
};

const yearAdapter: (data: IYearBackend) => IYear = data => {
  return {
    start_date: moment(data.start_date),
    end_date: moment(data.end_date),
  };
};

export const periodsListService = {
  getPeriods: async (structureId: string, groupId: string) => {
    const periods: any[] = await fetchJSONWithCache(`/viescolaire/periodes?idGroupe=${groupId}&idEtablissement=${structureId}`);
    const data: IPeriodsList = periodsListAdapter(periods);

    return data;
  },
  getYear: async (structureId: string) => {
    const year = await fetchJSONWithCache(`/viescolaire/settings/periode/schoolyear?structureId=${structureId}`);
    const result = yearAdapter(year);
    // AMVS-329 - hard coded values until api fix
    return { start_date: moment('2022-08-01'), end_date: moment('2023-08-05') };
  },
};
