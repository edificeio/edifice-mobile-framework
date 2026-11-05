import { Temporal } from '@js-temporal/polyfill';

import { CantineData } from '~/framework/modules/widgets/cantine/model';
import { sessionFetch } from '~/framework/util/transport';

export const cantineService = {
  menu: (uai: string, date: Temporal.PlainDate) =>
    sessionFetch.json<CantineData>(`/appregistry/${uai}/cantine/menu?date=${date.toString()}`),
};
