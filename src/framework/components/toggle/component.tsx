import React, { useEffect } from 'react';
import { Pressable } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { styles, TRANSLATE_X_OFF, TRANSLATE_X_ON } from './styles';
import { ToggleProps } from './types';

export const Toggle: React.FC<ToggleProps> = ({ checked, disabled = false, onChange }) => {
  const translateX = useSharedValue(checked ? TRANSLATE_X_ON : TRANSLATE_X_OFF);

  useEffect(() => {
    translateX.value = withTiming(checked ? TRANSLATE_X_ON : TRANSLATE_X_OFF, { duration: 150 });
  }, [checked, translateX]);

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={[styles.container, checked && styles.containerChecked]}>
      <Animated.View style={[styles.thumb, checked && styles.thumbChecked, disabled && styles.disabledThumb, thumbAnimatedStyle]} />
    </Pressable>
  );
};

export default Toggle;
