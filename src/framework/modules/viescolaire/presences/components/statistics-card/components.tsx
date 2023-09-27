import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { TouchCardWithoutPadding } from '~/framework/components/card/base';
import { BodyText, HeadingLText } from '~/framework/components/text';
import EventPicto from '~/framework/modules/viescolaire/presences/components/event-picto';
import { Event, EventType } from '~/framework/modules/viescolaire/presences/model';

import styles from './styles';
import { StatisticsCardProps } from './types';

const eventKeys = {
  [EventType.DEPARTURE]: 'departures',
  [EventType.FORGOTTEN_NOTEBOOK]: 'forgottennotebooks',
  [EventType.INCIDENT]: 'incidents',
  [EventType.LATENESS]: 'latenesses',
  [EventType.NO_REASON]: 'noreason',
  [EventType.PUNISHMENT]: 'punishments',
  [EventType.REGULARIZED]: 'regularized',
  [EventType.STATEMENT_ABSENCE]: 'absences',
  [EventType.UNREGULARIZED]: 'unregularized',
};

export default function StatisticsCard(props: StatisticsCardProps) {
  const eventKey = eventKeys[props.type];

  const openEventList = () => props.navigateToEventList(props.events, eventKey);

  const getTotal = (): number => {
    const { events, recoveryMethod } = props;

    if (
      ![EventType.NO_REASON, EventType.REGULARIZED, EventType.UNREGULARIZED].includes(props.type) ||
      !recoveryMethod ||
      recoveryMethod === 'HOUR'
    ) {
      return events.length;
    }
    const absenceDates = events.reduce((acc: string[], event: Event) => {
      const date = ('startDate' in event ? event.startDate : event.date).format(
        recoveryMethod === 'HALF_DAY' ? 'YYYY-MM-DD A' : 'YYYY-MM-DD',
      );
      if (acc.includes(date)) return acc;
      acc.push(date);
      return acc;
    }, []);
    return absenceDates.length;
  };

  return (
    <TouchCardWithoutPadding disabled={!props.events.length} onPress={openEventList} style={styles.container}>
      <EventPicto type={props.type} style={styles.pictoContainer} />
      <View style={styles.rowContainer}>
        <BodyText>{I18n.get(`presences-statistics-${eventKey}-title`)}</BodyText>
        <HeadingLText>{getTotal()}</HeadingLText>
      </View>
    </TouchCardWithoutPadding>
  );
}
