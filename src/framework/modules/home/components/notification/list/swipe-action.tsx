import * as React from 'react';
import { Pressable, View } from 'react-native';

import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { CaptionBoldText } from '~/framework/components/text';

import styles, { ACTION_ICON_SIZE } from './styles';
import { SwipeActionProps } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SwipeAction = React.memo(({ color, filled, icon, label, onPress, progress }: SwipeActionProps) => {
  const actionStyle = useAnimatedStyle(() => {
    const shown = Math.min(progress.value, 1);
    return { opacity: shown, transform: [{ scale: 0.7 + 0.3 * shown }] };
  });

  const buttonStyle = React.useMemo(
    () => [styles.actionButton, { backgroundColor: filled ? color : theme.palette.grey.white, borderColor: color }, actionStyle],
    [actionStyle, color, filled],
  );

  return (
    <View style={styles.action}>
      <AnimatedPressable accessibilityRole="button" onPress={onPress} style={buttonStyle}>
        <Svg
          name={icon}
          width={ACTION_ICON_SIZE}
          height={ACTION_ICON_SIZE}
          fill={filled ? theme.palette.grey.white : theme.palette.secondary.dark}
        />
      </AnimatedPressable>
      <Animated.View style={actionStyle}>
        <CaptionBoldText style={styles.actionText}>{label}</CaptionBoldText>
      </Animated.View>
    </View>
  );
});
