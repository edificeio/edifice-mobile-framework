import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';
import { HomeTopTabBarProps } from './types';

export function HomeTopTabBar({ descriptors, navigation, state }: HomeTopTabBarProps) {
  const line = theme.ui.navigation.line;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: index === state.index }}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
              testID={options.tabBarButtonTestID}>
              <View style={styles.labelContainer}>
                <SmallBoldText style={styles.label}>{label}</SmallBoldText>
                {options.tabBarBadge?.()}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {line ? (
        <View style={styles.line}>
          <Svg name={line} width="100%" height="100%" preserveAspectRatio="none" />
          <View style={[StyleSheet.absoluteFill, styles.blurs]}>
            {state.routes.map((route, index) => (
              <View key={route.key} style={[styles.blur, index === state.index && styles.blurFocused]} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
