import * as React from 'react';

import moment from 'moment';

import { AccountType, AuthActiveAccount, getFlattenedChildren } from '~/framework/modules/auth/model';
import { ScreenTimeDayResponse } from '~/framework/modules/widgets/screen-time/model';
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
      return [{ id: session.user.id, name: session.user.firstName, userId: session.user.id }];
    }

    return (getFlattenedChildren(session.user.children) ?? []).map(child => ({
      id: child.id,
      name: child.firstName,
      userId: child.id,
    }));
  }, [session.user]);
}

/**
 * The two durations the widget shows. They are loaded together so that the widget never displays
 * yesterday without today, which would read as a missing day rather than a pending one.
 */
export function useScreenTimeSummary(userId?: string) {
  const [summary, setSummary] = React.useState<ScreenTimeSummary>({ error: false, loading: true });

  const load = React.useCallback(async () => {
    if (!userId) return;

    setSummary({ error: false, loading: true });
    try {
      const [today, yesterday] = await Promise.all([
        screenTimeService.day(userId, moment()),
        screenTimeService.day(userId, moment().subtract(1, 'day')),
      ]);
      setSummary({ error: false, loading: false, today, yesterday });
    } catch {
      setSummary({ error: true, loading: false });
    }
  }, [userId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return { ...summary, load };
}
