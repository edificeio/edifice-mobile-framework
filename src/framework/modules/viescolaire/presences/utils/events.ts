import moment from 'moment';

import { Absence, Event, Statistics } from '~/framework/modules/viescolaire/presences/model';
import { subtractTime, today } from '~/framework/util/date';

export const compareEvents = (a: Event, b: Event): number => {
  const firstDate = 'startDate' in a ? a.startDate : a.date;
  const secondDate = 'startDate' in b ? b.startDate : b.date;
  return secondDate.diff(firstDate);
};

export const getRecentEvents = (statistics: Statistics, absenceStatements: Absence[]): Event[] => {
  const events: Event[] = [
    ...statistics.DEPARTURE.events,
    ...(statistics.FORGOTTEN_NOTEBOOK?.events ?? []),
    ...(statistics.INCIDENT?.events ?? []),
    ...statistics.LATENESS.events,
    ...statistics.NO_REASON.events,
    ...(statistics.PUNISHMENT?.events ?? []),
    ...statistics.REGULARIZED.events,
    ...statistics.UNREGULARIZED.events,
  ].filter(event => {
    const date = 'startDate' in event ? event.startDate : event.date;
    return subtractTime(today().startOf('day'), 1, 'month').isSameOrBefore(date) && moment().endOf('day').isSameOrAfter(date);
  });
  events.push(...absenceStatements);
  return events.sort(compareEvents);
};
