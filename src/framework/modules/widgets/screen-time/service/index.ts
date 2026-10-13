import moment from 'moment';

import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';
import { sessionFetch } from '~/framework/util/transport';

const DATE_FORMAT = 'YYYY-MM-DD';

const fetchScreenTime = <T>(path: string) => sessionFetch.json<T>(`/appregistry/screen-time/${path}`);

export const screenTimeService = {
  day: (userId: string, date: moment.Moment) =>
    fetchScreenTime<ScreenTimeDayResponse>(`${userId}/daily?date=${date.format(DATE_FORMAT)}&mock=false`),

  week: (userId: string, weekStart: moment.Moment) =>
    fetchScreenTime<ScreenTimeWeekResponse>(
      `${userId}/weekly?startDate=${weekStart.clone().startOf('week').format(DATE_FORMAT)}` +
        `&endDate=${weekStart.clone().endOf('week').format(DATE_FORMAT)}&mock=false`,
    ),
};
