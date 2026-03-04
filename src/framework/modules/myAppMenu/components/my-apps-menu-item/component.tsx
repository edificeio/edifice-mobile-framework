import React from 'react';
import { Pressable, View } from 'react-native';

import { styles } from './styles';
import { MyAppsMenuItemProps } from './types';

import { BodyText } from '~/framework/components/text';

export const MyAppsMenuItem: React.FC<MyAppsMenuItemProps> = ({ isPressable = true, label, leftElement, onPress }) => {
  if (!isPressable) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.leftElement}>{leftElement}</View>
        <View style={styles.labelWrapper}>
          <BodyText style={styles.label}>{label}</BodyText>
        </View>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && styles.wrapperPressed]}>
      <View style={styles.leftElement}>{leftElement}</View>
      <View style={styles.labelWrapper}>
        <BodyText style={styles.label}>{label}</BodyText>
      </View>
    </Pressable>
  );
};
