import { Temporal } from '@js-temporal/polyfill';

import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';
import { sessionFetch } from '~/framework/util/transport';

const fetchScreenTime = <T>(path: string) => sessionFetch.json<T>(`/appregistry/screen-time/${path}`);

export const screenTimeService = {
  day: (userId: string, date: Temporal.PlainDate) =>
    fetchScreenTime<ScreenTimeDayResponse>(`${userId}/daily?date=${date.toString()}&mock=false`),

  week: (userId: string, firstDay: Temporal.PlainDate) =>
    fetchScreenTime<ScreenTimeWeekResponse>(
      `${userId}/weekly?startDate=${firstDay.toString()}&endDate=${firstDay.add({ days: 6 }).toString()}&mock=false`,
    ),
};
