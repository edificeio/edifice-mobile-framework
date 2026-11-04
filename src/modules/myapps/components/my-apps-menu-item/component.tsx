import React from 'react';
import { Pressable, PressableProps, View, ViewProps } from 'react-native';

import { BodyText } from '~/framework/components/text';

import { styles } from './styles';
import { MyAppsMenuItemProps } from './types';

/** A line of a menu of « Mes applis » (sheets `myapps/menu`, `myapps/app-actions`): an element on the left (icon, switch…), a label. */
export const MyAppsMenuItem = ({ containerStyle, isPressable = true, label, leftElement, ...rest }: MyAppsMenuItemProps) => {
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
