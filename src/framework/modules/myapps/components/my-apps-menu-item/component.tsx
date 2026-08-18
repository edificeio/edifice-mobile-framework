import React from 'react';
import { View, ViewProps } from 'react-native';

import { Pressable, PressableProps } from 'react-native-gesture-handler';

import { BodyText } from '~/framework/components/text';

import { styles } from './styles';
import { MyAppsMenuItemProps } from './types';

export const MyAppsMenuItem: React.FC<MyAppsMenuItemProps> = ({
  containerStyle,
  isPressable = true,
  label,
  leftElement,
  ...rest
}) => {
  if (!isPressable) {
    return (
      <View {...(rest as ViewProps)} style={[styles.wrapper, containerStyle]}>
        <View style={styles.leftElement}>{leftElement}</View>
        <View style={styles.labelWrapper}>
          <BodyText style={styles.label}>{label}</BodyText>
        </View>
      </View>
    );
  }

  return (
    <Pressable {...(rest as PressableProps)} style={({ pressed }) => [styles.wrapper, pressed && styles.wrapperPressed]}>
      <View style={styles.leftElement}>{leftElement}</View>
      <View style={styles.labelWrapper}>
        <BodyText style={styles.label}>{label}</BodyText>
      </View>
    </Pressable>
  );
};
