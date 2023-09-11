import { Moment } from 'moment';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { BodyText, CaptionBoldText, NestedBoldText } from '~/framework/components/text';
import { UserType } from '~/framework/modules/auth/service';
import HistoryEventCard from '~/framework/modules/viescolaire/presences/components/history-event-card';
import {
  HistoryEventType,
  IAbsence,
  IForgottenNotebook,
  IHistoryEvent,
  IIncident,
  IPunishment,
} from '~/framework/modules/viescolaire/presences/model';
import appConf from '~/framework/util/appConf';

import styles from './styles';

const formatAbsenceDates = (startDate: Moment, endDate: Moment): string => {
  if (!endDate.isSame(startDate, 'day')) {
    return I18n.get('presences-history-eventcard-fromdate', { start: startDate.format('D'), end: endDate.format('D MMMM') });
  } else if (appConf.is1d) {
    const timeLabel = I18n.get(
      startDate.get('hour') < 12 ? 'presences-history-eventcard-morning' : 'presences-history-eventcard-afternoon',
    );
    return `${startDate.format('D MMMM')} (${timeLabel})`;
  } else {
    return `${startDate.format('D MMMM')} ${I18n.get('presences-history-eventcard-absence-time', {
      start: startDate.format('H'),
      end: endDate.format('H'),
    })}`;
  }
};

export const AbsenceCard = ({ event }: { event: IHistoryEvent }) => {
  const isSingleDay = event.endDate.isSame(event.startDate, 'day');

  const getEventLabel = () => {
    switch (event.type) {
      case HistoryEventType.NO_REASON:
        return I18n.get(appConf.is1d ? 'presences-history-eventcard-noreason-1d' : 'presences-history-eventcard-noreason-2d');
      case HistoryEventType.REGULARIZED:
        return I18n.get(appConf.is1d ? 'presences-history-eventcard-regularized-1d' : 'presences-history-eventcard-regularized-2d');
      case HistoryEventType.UNREGULARIZED:
      default:
        return I18n.get(
          appConf.is1d ? 'presences-history-eventcard-unregularized-1d' : 'presences-history-eventcard-unregularized-2d',
        );
    }
  };

  return (
    <HistoryEventCard event={event}>
      <BodyText>
        {getEventLabel()}
        {event.type !== HistoryEventType.REGULARIZED
          ? I18n.get(isSingleDay ? 'presences-history-eventcard-on' : 'presences-history-eventcard-from')
          : null}
        <NestedBoldText>{formatAbsenceDates(event.startDate, event.endDate)}</NestedBoldText>
      </BodyText>
      {event.type !== HistoryEventType.NO_REASON && event.reasonLabel ? (
        <CaptionBoldText style={styles.secondaryText}>
          {I18n.get('presences-history-eventcard-reason', { reason: event.reasonLabel })}
        </CaptionBoldText>
      ) : null}
    </HistoryEventCard>
  );
};

export const DepartureCard = ({ event }: { event: IHistoryEvent }) => {
  const duration = event.endDate.diff(event.startDate, 'minutes');

  return (
    <HistoryEventCard event={event}>
      <BodyText>
        {I18n.get('presences-history-eventcard-departure-start')}
        <NestedBoldText>{I18n.get('presences-history-eventcard-departure-duration', { duration })}</NestedBoldText>
        {I18n.get('presences-history-eventcard-departure-declared')}
        <NestedBoldText>
          {I18n.get('presences-history-eventcard-departure-date', {
            date: event.startDate.format('DD MMMM'),
            time: event.endDate.format('H'),
          })}
        </NestedBoldText>
      </BodyText>
      {event.comment ? (
        <CaptionBoldText style={styles.secondaryText}>
          {I18n.get('presences-history-eventcard-reason', { reason: event.comment })}
        </CaptionBoldText>
      ) : null}
    </HistoryEventCard>
  );
};

export const ForgottenNotebookCard = ({ event }: { event: IForgottenNotebook }) => {
  return (
    <HistoryEventCard event={event}>
      <BodyText>
        {I18n.get('presences-history-eventcard-forgottennotebook')}
        <NestedBoldText>{event.date.format('D MMMM')}</NestedBoldText>
      </BodyText>
    </HistoryEventCard>
  );
};

export const IncidentCard = ({ event }: { event: IIncident }) => {
  return (
    <HistoryEventCard event={event}>
      <BodyText>
        {I18n.get('presences-history-eventcard-incident', { level: event.description })}
        <NestedBoldText>{event.date.format('D MMMM (H[h]mm)')}</NestedBoldText>
      </BodyText>
      {event.typeLabel ? (
        <CaptionBoldText style={styles.secondaryText}>
          {I18n.get('presences-history-eventcard-type', { type: event.typeLabel })}
        </CaptionBoldText>
      ) : null}
    </HistoryEventCard>
  );
};

export const LatenessCard = ({ event }: { event: IHistoryEvent }) => {
  const duration = event.endDate.diff(event.startDate, 'minutes');

  return (
    <HistoryEventCard event={event}>
      <BodyText>
        {I18n.get('presences-history-eventcard-lateness-start')}
        <NestedBoldText>{I18n.get('presences-history-eventcard-lateness-duration', { duration })}</NestedBoldText>
        {I18n.get('presences-history-eventcard-lateness-declared')}
        <NestedBoldText>
          {I18n.get('presences-history-eventcard-lateness-date', {
            date: event.startDate.format('DD MMMM'),
            time: event.startDate.format('H'),
          })}
        </NestedBoldText>
      </BodyText>
    </HistoryEventCard>
  );
};

export const PunishmentCard = ({ event }: { event: IPunishment }) => {
  return (
    <HistoryEventCard event={event}>
      <BodyText>
        {I18n.get('presences-history-eventcard-punishment')}
        <NestedBoldText>{event.createdAt.format('D MMMM (H[h]mm)')}</NestedBoldText>
      </BodyText>
      {event.typeLabel ? (
        <CaptionBoldText style={styles.secondaryText}>
          {I18n.get('presences-history-eventcard-type', { type: event.typeLabel })}
        </CaptionBoldText>
      ) : null}
    </HistoryEventCard>
  );
};

export const StatementAbsenceCard = ({ event, userType }: { event: IAbsence; userType?: UserType }) => {
  const isSingleDay = event.endDate.isSame(event.startDate, 'day');

  return (
    <HistoryEventCard event={event}>
      <BodyText>
        {userType === UserType.Relative
          ? I18n.get('presences-history-eventcard-statementabsence-relative', { childName: event.studentFirstName })
          : I18n.get('presences-history-eventcard-statementabsence-student')}
        {I18n.get(isSingleDay ? 'presences-history-eventcard-on' : 'presences-history-eventcard-from')}
        <NestedBoldText>{formatAbsenceDates(event.startDate, event.endDate)}</NestedBoldText>
      </BodyText>
      {event.description ? (
        <CaptionBoldText style={styles.secondaryText}>
          {I18n.get('presences-history-eventcard-reason', { reason: event.description })}
        </CaptionBoldText>
      ) : null}
    </HistoryEventCard>
  );
};
