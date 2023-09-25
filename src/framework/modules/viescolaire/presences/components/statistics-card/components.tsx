import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { TouchCardWithoutPadding } from '~/framework/components/card/base';
import { BodyText, HeadingLText } from '~/framework/components/text';
import EventPicto from '~/framework/modules/viescolaire/presences/components/event-picto';
import { EventType } from '~/framework/modules/viescolaire/presences/model';

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

  return (
    <TouchCardWithoutPadding disabled={!props.events.length} onPress={openEventList} style={styles.container}>
      <EventPicto type={props.type} style={styles.pictoContainer} />
      <View style={styles.rowContainer}>
        <BodyText>{I18n.get(`presences-statistics-${eventKey}-title`)}</BodyText>
        <HeadingLText>{props.events.length}</HeadingLText>
      </View>
    </TouchCardWithoutPadding>
  );
}
