import * as React from 'react';
import { Pressable, View } from 'react-native';

import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { CaptionBoldText } from '~/framework/components/text';

import styles, { ACTION_ICON_SIZE } from './styles';
import { SwipeActionProps } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// the button grows from this scale to its full size as the row uncovers it.
const HIDDEN_ACTION_SCALE = 0.7;

const SwipeAction = ({ color, filled, icon, label, onPress, progress, testID }: Readonly<SwipeActionProps>) => {
  const actionStyle = useAnimatedStyle(() => {
    const shown = Math.min(progress.value, 1);
    return { opacity: shown, transform: [{ scale: HIDDEN_ACTION_SCALE + (1 - HIDDEN_ACTION_SCALE) * shown }] };
  });

  const buttonStyle = React.useMemo(
    () => [styles.actionButton, { backgroundColor: filled ? color : theme.palette.grey.white, borderColor: color }, actionStyle],
    [actionStyle, color, filled],
  );

  return (
    <View style={styles.action}>
      <AnimatedPressable accessibilityRole="button" onPress={onPress} style={buttonStyle} testID={testID}>
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
};

export default React.memo(SwipeAction);
