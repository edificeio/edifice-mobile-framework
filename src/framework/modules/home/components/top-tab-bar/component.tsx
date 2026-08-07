import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';
import { HomeTopTabBarProps } from './types';

const focusedIndicatorStyle = [styles.indicator, styles.indicatorFocused];

export function HomeTopTabBar({ descriptors, navigation, state }: HomeTopTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const focused = index === state.index;
        const { options } = descriptors[route.key];
        const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name);

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="tab"
            activeOpacity={0.7}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
            testID={options.tabBarButtonTestID}>
            <View style={styles.labelContainer}>
              <SmallBoldText style={styles.label}>{label}</SmallBoldText>
              {options.tabBarBadge?.()}
            </View>
            <View style={focused ? focusedIndicatorStyle : styles.indicator} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
