import React from 'react';
import { View } from 'react-native';

import { Pressable } from 'react-native-gesture-handler';

import { BodyText } from '~/framework/components/text';

import { styles } from './styles';
import { MyAppsMenuItemProps } from './types';

export const MyAppsMenuItem: React.FC<MyAppsMenuItemProps> = ({ isPressable = true, label, leftElement, onPress, testID }) => {
  if (!isPressable) {
    return (
      <View style={styles.wrapper} testID={testID}>
        <View style={styles.leftElement}>{leftElement}</View>
        <View style={styles.labelWrapper}>
          <BodyText style={styles.label}>{label}</BodyText>
        </View>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && styles.wrapperPressed]} testID={testID}>
      <View style={styles.leftElement}>{leftElement}</View>
      <View style={styles.labelWrapper}>
        <BodyText style={styles.label}>{label}</BodyText>
      </View>
    </Pressable>
  );
};
