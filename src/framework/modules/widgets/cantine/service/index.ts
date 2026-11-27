import { Temporal } from '@js-temporal/polyfill';

import { getDemoCantineData } from '~/framework/modules/widgets/cantine/demo';
import { CantineData } from '~/framework/modules/widgets/cantine/model';
import { sessionFetch } from '~/framework/util/transport';

/** AO demo: `true` serves the mocks of `cantine/demo` without any network call, `false` calls the real API. */
const DEMO_WIDGETS = true;

export const cantineService = {
  menu: (uai: string, date: Temporal.PlainDate) =>
    DEMO_WIDGETS
      ? Promise.resolve(getDemoCantineData(date.toString()))
      : sessionFetch.json<CantineData>(`/appregistry/${uai}/cantine/menu?date=${date.toString()}`),
};
