/**
 * Demo data for the screen time widget (AO demo), in the format returned by
 * `/appregistry/screen-time/:childId/daily` and `/weekly`, aggregates included.
 *
 * Same figures as the web homepage demo (entcore `timeline/frontend`, `ScreenTimeDemo`):
 * made up but stable for a given date, more on Wednesday afternoon and at the
 * weekend, nothing for the hours and days to come.
 */
import {
  ScreenTimeDailySummary,
  ScreenTimeDayResponse,
  ScreenTimeDuration,
  ScreenTimeWeekResponse,
} from '~/framework/modules/widgets/screen-time/model';

/** Share of the daily screen time spent at each hour, from 0h to 23h. */
const SCHOOL_DAY_WEIGHTS = [0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 2, 3, 2, 4, 3, 2, 3, 6, 8, 5, 7, 5, 1, 0];
const DAY_OFF_WEIGHTS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 5, 2, 3, 5, 6, 6, 5, 6, 5, 7, 6, 2, 0];

/** School use shown on the weekly view, as in the web demo. */
const WEEKLY_SCHOOL_USE_PERCENTAGE = 30;

const pad = (value: number) => String(value).padStart(2, '0');

/** Local "YYYY-MM-DD" date. */
const toDay = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Local date of a "YYYY-MM-DD" day (not `new Date(day)`, which reads it as UTC). */
const parseDay = (day: string): Date => {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
};

const addDays = (day: string, days: number): string => {
  const date = parseDay(day);
  date.setDate(date.getDate() + days);
  return toDay(date);
};

const roundTo = (value: number, decimals: number) => Math.round(value * 10 ** decimals) / 10 ** decimals;

/** "2h22m51s", as the backend writes it: zero parts are left out. */
const durationString = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours > 0 ? `${hours}h` : ''}${minutes > 0 ? `${minutes}m` : ''}${seconds > 0 ? `${seconds}s` : ''}`;
};

/** The 24 hours of the day, empty ones included, as the backend lists them. */
const durationsOf = (day: string): ScreenTimeDuration[] => {
  const now = new Date();
  const today = toDay(now);
  const date = parseDay(day);
  const weekDay = date.getDay();
  const isDayOff = weekDay === 0 || weekDay === 6;
  const weights = isDayOff ? DAY_OFF_WEIGHTS : SCHOOL_DAY_WEIGHTS;
  const total = (isDayOff ? 165 : weekDay === 3 ? 130 : 95) + ((date.getDate() * 13) % 40) - 20;
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const lastHour = day > today ? -1 : day === today ? now.getHours() : 23;

  return weights.map((weight, hour) => {
    const durationMinutes = hour <= lastHour ? Math.round((total * weight) / weightSum) : 0;
    const isSchoolHour = !isDayOff && hour >= 8 && hour < 17;
    return {
      durationMinutes,
      hour: pad(hour),
      schoolUsePercentage: durationMinutes > 0 ? (isSchoolHour ? 60 : 5) : 0,
    };
  });
};

const minutesOf = (day: string): number => durationsOf(day).reduce((sum, entry) => sum + entry.durationMinutes, 0);

/** Screen time of the given day ("YYYY-MM-DD"), as `/appregistry/screen-time/:childId/daily` returns it. */
export function getDemoDailyScreenTime(date: string): ScreenTimeDayResponse {
  const durations = durationsOf(date);
  const totalMinutes = durations.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  return {
    durations,
    totalDurationHours: roundTo(totalMinutes / 60, 2),
    totalDurationString: durationString(totalMinutes * 60),
  };
}

/**
 * Screen time from `startDate` to `endDate` ("YYYY-MM-DD", both included), as
 * `/appregistry/screen-time/:childId/weekly` returns it: averages are over the
 * days with screen time only.
 */
export function getDemoWeeklyScreenTime(startDate: string, endDate: string): ScreenTimeWeekResponse {
  const dailySummaries: ScreenTimeDailySummary[] = [];
  // A week at most: also stops on a malformed date
  for (let day = startDate; day <= endDate && dailySummaries.length < 7; day = addDays(day, 1)) {
    const durationMinutes = minutesOf(day);
    dailySummaries.push({
      date: day,
      durationMinutes,
      schoolUsePercentage: durationMinutes > 0 ? WEEKLY_SCHOOL_USE_PERCENTAGE : 0,
    });
  }

  const daysWithScreenTime = dailySummaries.filter(summary => summary.durationMinutes > 0).length;
  const totalSeconds = dailySummaries.reduce((sum, summary) => sum + summary.durationMinutes * 60, 0);
  const averageSeconds = daysWithScreenTime > 0 ? Math.floor(totalSeconds / daysWithScreenTime) : 0;

  return {
    averageDurationHours: daysWithScreenTime > 0 ? roundTo(averageSeconds / 3600, 2) : 0,
    averageDurationString: durationString(averageSeconds),
    averageSchoolUsePercentage: daysWithScreenTime > 0 ? WEEKLY_SCHOOL_USE_PERCENTAGE : 0,
    dailySummaries,
  };
}
