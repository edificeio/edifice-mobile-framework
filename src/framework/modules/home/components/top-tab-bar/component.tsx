import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';
import { HomeTopTabBarProps } from './types';

const focusedIndicatorStyle = [styles.indicator, styles.indicatorFocused];

export function HomeTopTabBar({ jumpTo, navigationState }: HomeTopTabBarProps) {
  return (
    <View style={styles.container}>
      {navigationState.routes.map((route, index) => {
        const focused = index === navigationState.index;

        return (
          <TouchableOpacity key={route.key} activeOpacity={0.7} onPress={() => jumpTo(route.key)} style={styles.tab}>
            <View style={styles.labelContainer}>
              <SmallBoldText style={styles.labelFocused}>{I18n.get(route.title)}</SmallBoldText>
              {route.badge ? <Badge content={route.badge} color={theme.palette.complementary.red.regular} /> : null}
            </View>
            <View style={focused ? focusedIndicatorStyle : styles.indicator} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
