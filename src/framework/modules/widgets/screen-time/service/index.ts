import moment from 'moment';

import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';
import { ISO_DATE_FORMAT } from '~/framework/util/date';
import { sessionFetch } from '~/framework/util/transport';

const fetchScreenTime = <T>(path: string) => sessionFetch.json<T>(`/appregistry/screen-time/${path}`);

export const screenTimeService = {
  day: (userId: string, date: moment.Moment) =>
    fetchScreenTime<ScreenTimeDayResponse>(`${userId}/daily?date=${date.format(ISO_DATE_FORMAT)}&mock=false`),

  week: (userId: string, weekStart: moment.Moment) =>
    fetchScreenTime<ScreenTimeWeekResponse>(
      `${userId}/weekly?startDate=${weekStart.clone().startOf('week').format(ISO_DATE_FORMAT)}` +
        `&endDate=${weekStart.clone().endOf('week').format(ISO_DATE_FORMAT)}&mock=false`,
    ),
};
