import { Temporal } from '@js-temporal/polyfill';

import { getDemoDailyScreenTime, getDemoWeeklyScreenTime } from '~/framework/modules/widgets/screen-time/demo';
import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';
import { sessionFetch } from '~/framework/util/transport';

/** AO demo: `true` serves the mocks of `screen-time/demo` without any network call, `false` calls the real API. */
const DEMO_WIDGETS = true;

const fetchScreenTime = <T>(path: string) => sessionFetch.json<T>(`/appregistry/screen-time/${path}`);

export const screenTimeService = {
  day: (userId: string, date: Temporal.PlainDate) =>
    DEMO_WIDGETS
      ? Promise.resolve(getDemoDailyScreenTime(date.toString()))
      : fetchScreenTime<ScreenTimeDayResponse>(`${userId}/daily?date=${date.toString()}&mock=false`),

  week: (userId: string, firstDay: Temporal.PlainDate) =>
    DEMO_WIDGETS
      ? Promise.resolve(getDemoWeeklyScreenTime(firstDay.toString(), firstDay.add({ days: 6 }).toString()))
      : fetchScreenTime<ScreenTimeWeekResponse>(
          `${userId}/weekly?startDate=${firstDay.toString()}&endDate=${firstDay.add({ days: 6 }).toString()}&mock=false`,
        ),
};
