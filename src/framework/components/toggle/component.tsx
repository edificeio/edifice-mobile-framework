import * as React from 'react';
import { Pressable, View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import theme from '~/app/theme';

import { styles, TRANSLATE_X_OFF, TRANSLATE_X_ON } from './styles';
import { ToggleProps, ToggleSide } from './types';

const TRANSITION_DURATION = 150;

const colors = theme.ui.toggle;

const restingPosition = (checked: boolean, side: ToggleSide) => {
  if (side === 'right') return checked ? TRANSLATE_X_OFF : TRANSLATE_X_ON;
  return checked ? TRANSLATE_X_ON : TRANSLATE_X_OFF;
};

const trackColors = (checked: boolean, disabled?: boolean, isPressed?: boolean) => {
  if (checked)
    return {
      background: disabled ? colors.disabledBackground : colors.background,
      border: disabled ? colors.disabledBackground : colors.border,
      content: disabled ? colors.disabledContent : colors.content,
    };
  return {
    background: colors.offBackground,
    border: disabled ? colors.disabledOffBorder : isPressed ? colors.pressedOffBorder : colors.offBorder,
    content: disabled ? colors.disabledOffContent : colors.offContent,
  };
};

export const Toggle: React.FC<ToggleProps> = ({ checked, disabled = false, onChange, side = 'left', testID }) => {
  const translateX = useSharedValue(restingPosition(checked, side));

  React.useEffect(() => {
    translateX.value = withTiming(restingPosition(checked, side), { duration: TRANSITION_DURATION });
  }, [checked, side, translateX]);

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onPress = () => onChange(!checked);

  const renderToggle = ({ pressed }: Readonly<{ pressed: boolean }>) => {
    const track = trackColors(checked, disabled, pressed);

    return (
      <View style={[styles.halo, pressed && !disabled && { backgroundColor: colors.highlight }]}>
        <View style={[styles.track, { backgroundColor: track.background, borderColor: track.border }]}>
          <Animated.View style={[styles.thumb, { backgroundColor: track.content }, thumbAnimatedStyle]} />
        </View>
      </View>
    );
  };

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.pressable} testID={testID}>
      {renderToggle}
    </Pressable>
  );
};

export default Toggle;
