import * as React from 'react';

import moment from 'moment';

import { AccountType, AuthActiveAccount, getFlattenedChildren } from '~/framework/modules/auth/model';
import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';
import { screenTimeService } from '~/framework/modules/widgets/screen-time/service';

interface ScreenTimeSummary {
  today?: ScreenTimeDayResponse;
  yesterday?: ScreenTimeDayResponse;
  error: boolean;
  loading: boolean;
}

export function useScreenTimeUsers(session: AuthActiveAccount) {
  return React.useMemo(() => {
    if (session.user.type !== AccountType.Relative) {
      return [{ id: session.user.id, name: session.user.firstName }];
    }

    return (getFlattenedChildren(session.user.children) ?? []).map(child => ({ id: child.id, name: child.firstName }));
  }, [session.user]);
}

/**
 * The two durations the widget shows. They are loaded together so that the widget never displays
 * yesterday without today, which would read as a missing day rather than a pending one.
 */
export function useScreenTimeSummary(userId?: string) {
  const [summary, setSummary] = React.useState<ScreenTimeSummary>({ error: false, loading: true });
  // A request left behind by a change of user has nothing left to say.
  const pending = React.useRef<boolean>(false);

  const load = React.useCallback(async () => {
    if (!userId) return;

    pending.current = true;
    setSummary({ error: false, loading: true });
    try {
      const [today, yesterday] = await Promise.all([
        screenTimeService.day(userId, moment()),
        screenTimeService.day(userId, moment().subtract(1, 'day')),
      ]);
      if (pending.current) setSummary({ error: false, loading: false, today, yesterday });
    } catch {
      if (pending.current) setSummary({ error: true, loading: false });
    }
  }, [userId]);

  React.useEffect(() => {
    load();
    return () => {
      pending.current = false;
    };
  }, [load]);

  return { ...summary, load };
}

/** The hours of a day, as the back end gives them. */
export function useScreenTimeDay(userId: string, date: moment.Moment) {
  const [day, setDay] = React.useState<ScreenTimeDayResponse>();

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await screenTimeService.day(userId, date);
        if (!cancelled) setDay(response);
      } catch (error) {
        console.error('[ScreenTime] failed to load the day', error);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [userId, date]);

  return day;
}

/** The days of a week, as the back end gives them. */
export function useScreenTimeWeek(userId: string, weekStart: moment.Moment) {
  const [week, setWeek] = React.useState<ScreenTimeWeekResponse>();

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await screenTimeService.week(userId, weekStart);
        if (!cancelled) setWeek(response);
      } catch (error) {
        console.error('[ScreenTime] failed to load the week', error);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [userId, weekStart]);

  return week;
}
