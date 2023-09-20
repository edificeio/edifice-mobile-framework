import React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { Picture } from '~/framework/components/picture';
import { EventType } from '~/framework/modules/viescolaire/presences/model';

import styles from './styles';
import type { HistoryEventCardProps, HistoryEventCardStyle } from './types';

export default class HistoryEventCard extends React.PureComponent<HistoryEventCardProps> {
  private getStyle(): HistoryEventCardStyle {
    switch (this.props.type) {
      case EventType.DEPARTURE:
        return {
          backgroundColor: theme.palette.complementary.pink.pale,
          iconColor: theme.palette.complementary.pink.regular,
          iconName: 'ui-leave',
        };
      case EventType.FORGOTTEN_NOTEBOOK:
        return {
          backgroundColor: theme.palette.complementary.indigo.pale,
          iconColor: theme.palette.complementary.indigo.regular,
          iconName: 'ui-alert-triangle',
        };
      case EventType.INCIDENT:
        return {
          backgroundColor: theme.palette.grey.black,
          iconColor: theme.palette.grey.pearl,
          iconName: 'ui-alert-triangle',
        };
      case EventType.LATENESS:
        return {
          backgroundColor: theme.palette.complementary.purple.pale,
          iconColor: theme.palette.complementary.purple.regular,
          iconName: 'ui-clock-alert',
        };
      case EventType.NO_REASON:
        return {
          backgroundColor: theme.palette.complementary.red.pale,
          iconColor: theme.palette.complementary.red.regular,
          iconName: 'ui-error',
        };
      case EventType.PUNISHMENT:
        return {
          backgroundColor: theme.palette.complementary.yellow.pale,
          iconColor: theme.palette.complementary.yellow.regular,
          iconName: 'ui-alert-triangle',
        };
      case EventType.REGULARIZED:
        return {
          backgroundColor: theme.palette.complementary.green.pale,
          iconColor: theme.palette.complementary.green.regular,
          iconName: 'ui-success',
        };
      case EventType.STATEMENT_ABSENCE:
        return {
          backgroundColor: theme.palette.grey.pearl,
          iconColor: theme.palette.grey.black,
          iconName: 'ui-write',
        };
      case EventType.UNREGULARIZED:
        return {
          backgroundColor: theme.palette.complementary.orange.pale,
          iconColor: theme.palette.complementary.orange.regular,
          iconName: 'ui-alertCircle',
        };
    }
  }

  public render() {
    const { backgroundColor, iconColor, iconName } = this.getStyle();

    return (
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor }]}>
          <Picture type="NamedSvg" name={iconName} width={24} height={24} fill={iconColor} />
        </View>
        <View style={[styles.contentContainer, this.props.style]}>{this.props.children}</View>
      </View>
    );
  }
}