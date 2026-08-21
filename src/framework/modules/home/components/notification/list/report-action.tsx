import * as React from 'react';
import { Pressable, View } from 'react-native';

import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { CaptionText } from '~/framework/components/text';

import styles, { REPORT_ICON_SIZE } from './styles';
import { ReportActionProps } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ReportAction = React.memo(({ onPress, progress }: ReportActionProps) => {
  const actionStyle = useAnimatedStyle(() => {
    const shown = Math.min(progress.value, 1);
    return { opacity: shown, transform: [{ scale: 0.7 + 0.3 * shown }] };
  });

  return (
    <View style={styles.reportAction}>
      <AnimatedPressable accessibilityRole="button" onPress={onPress} style={[styles.reportButton, actionStyle]}>
        <Svg name="ui-alert-triangle" width={REPORT_ICON_SIZE} height={REPORT_ICON_SIZE} fill={theme.palette.secondary.dark} />
      </AnimatedPressable>
      <Animated.View style={actionStyle}>
        <CaptionText style={styles.reportText}>{I18n.get('timeline-reportaction-button')}</CaptionText>
      </Animated.View>
    </View>
  );
});
