import React from 'react';
import { View } from 'react-native';

import styles from './styles';
import type { HistoryEventCardProps } from './types';

import EventPicto from '~/framework/modules/viescolaire/presences/components/event-picto';

export default class HistoryEventCard extends React.PureComponent<HistoryEventCardProps> {
  public render() {
    return (
      <View style={styles.container}>
        <EventPicto type={this.props.type} />
        <View style={[styles.contentContainer, this.props.style]}>{this.props.children}</View>
      </View>
    );
  }
}
