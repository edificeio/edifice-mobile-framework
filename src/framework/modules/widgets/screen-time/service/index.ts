import moment from 'moment';

import { getPlatform } from '~/framework/modules/auth/redux/reducer';
import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';
import { sessionFetch } from '~/framework/util/transport';

const DATE_FORMAT = 'YYYY-MM-DD';

const fetchScreenTime = async <T>(path: string): Promise<T | undefined> => {
  const platformUrl = getPlatform()?.url;
  if (!platformUrl) return undefined;

  const response = await sessionFetch(`${platformUrl}/appregistry/screen-time/${path}`);
  if (!response.ok) throw new global.Error(`Screen time request failed with status ${response.status}`);

  return (await response.json()) as T;
};

export const screenTimeService = {
  day: (userId: string, date: moment.Moment) =>
    fetchScreenTime<ScreenTimeDayResponse>(`${userId}/daily?date=${date.format(DATE_FORMAT)}&mock=false`),

  week: (userId: string, weekStart: moment.Moment) =>
    fetchScreenTime<ScreenTimeWeekResponse>(
      `${userId}/weekly?startDate=${weekStart.clone().startOf('week').format(DATE_FORMAT)}` +
        `&endDate=${weekStart.clone().endOf('week').format(DATE_FORMAT)}&mock=false`,
    ),
};
