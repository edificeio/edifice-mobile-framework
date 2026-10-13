import { I18n } from '~/app/i18n';
import type { ScreenTimeDayResponse } from '~/framework/modules/widgets/screen-time/model';

const MINUTES_PER_HOUR = 60;

const MINUTES_DIGITS = 2;

/**
 * Writes a number of minutes the way the design writes a duration, hours and minutes once there
 * are hours. Minutes are padded here rather than in the translation, which cannot do it.
 */
export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainingMinutes = minutes % MINUTES_PER_HOUR;

  return hours
    ? I18n.get('widget-screen-time-duration-hours-minutes', {
        hours,
        minutes: String(remainingMinutes).padStart(MINUTES_DIGITS, '0'),
      })
    : I18n.get('widget-screen-time-duration-minutes', { minutes });
};

export const totalMinutes = (day?: ScreenTimeDayResponse) =>
  day?.durations.reduce((total, hour) => total + hour.durationMinutes, 0) ?? 0;
