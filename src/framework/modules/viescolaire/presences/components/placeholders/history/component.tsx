import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import styles from './styles';

import EventCardPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/event-card';

export default function HistoryPlaceholder() {
  return (
    <Placeholder Animation={Fade}>
      <View style={styles.listContainer}>
        <PlaceholderLine width={80} style={[styles.mb0, styles.h22, styles.br4]} />
        <EventCardPlaceholder />
        <EventCardPlaceholder />
        <EventCardPlaceholder />
      </View>
    </Placeholder>
  );
}
