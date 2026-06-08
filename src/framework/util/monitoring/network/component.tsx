import * as React from 'react';
import { ActivityIndicator, Animated, ColorValue, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture';
import { SmallInverseText } from '~/framework/components/text';

import { useNetworkStatus } from './provider';
import { styles, TrackingContainer } from './styles';
import { NetworkMonitorBarProps } from './types';

export const NetworkMonitorBar = ({ style }: NetworkMonitorBarProps) => {
  const { check, connected, loading, visible } = useNetworkStatus();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const previousVisibleRef = React.useRef<boolean>(connected === true); // start showing at startup only if no connection.

  // Animate on visibility change
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (visible && !previousVisibleRef.current) {
        previousVisibleRef.current = true;
        Animated.timing(fadeAnim, {
          toValue: 1,
          ...UI_ANIMATIONS.fade,
        }).start();
        Animated.timing(slideAnim, {
          toValue: 40,
          ...UI_ANIMATIONS.translate,
        }).start();
      }
      if (!visible && previousVisibleRef.current && connected) {
        previousVisibleRef.current = false;
        Animated.timing(fadeAnim, {
          toValue: 0,
          ...UI_ANIMATIONS.fade,
        }).start();
        Animated.timing(slideAnim, {
          toValue: 0,
          ...UI_ANIMATIONS.translate,
        }).start();
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [visible, connected, fadeAnim, slideAnim]);

  const iconName = React.useMemo<string>(() => {
    if (loading) return 'loading';
    if (connected) return 'checked';
    return 'retry';
  }, [loading, connected]);

  const i18n = React.useMemo<string>(() => {
    if (loading) return 'connectiontrackingbar-connecting';
    if (connected) return 'connectiontrackingbar-connected';
    return 'connectiontrackingbar-disconnected';
  }, [loading, connected]);

  const barColor = React.useMemo<ColorValue>(() => {
    if (loading) return theme.palette.status.warning.regular;
    if (connected) return theme.palette.status.success.regular;
    return theme.palette.status.failure.regular;
  }, [loading, connected]);

  return (
    <Animated.View style={[styles.container, style, { height: slideAnim, opacity: fadeAnim }]}>
      <TrackingContainer style={{ backgroundColor: barColor }} onPress={check}>
        <View style={styles.innerRow}>
          <SmallInverseText style={styles.text}>{I18n.get(i18n)}</SmallInverseText>
          {loading ? (
            <ActivityIndicator size="small" color={theme.ui.text.inverse} style={styles.activityIndicator} />
          ) : (
            <Icon name={iconName} size={18} style={styles.icon} color={theme.ui.text.inverse} />
          )}
        </View>
      </TrackingContainer>
    </Animated.View>
  );
};

export default NetworkMonitorBar;
