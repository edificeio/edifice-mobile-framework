import * as React from 'react';
import { Animated, Easing, LayoutChangeEvent } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ToastMessage, { ToastConfig } from 'react-native-toast-message';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

import theme, { IShades } from '~/app/theme';
import AlertCard, { AlertCardProps } from '~/framework/components/alert';
import { toastConfigColor } from '~/framework/components/alert/model';
import IconButton from '~/framework/components/buttons/icon';
import { UI_SIZES } from '~/framework/components/constants';

import styles from './styles';
import { ToastParams, ToastProps } from './types';

// Config constants for Toasts

const TOAST_DURATION = 6000;
const TOAST_TOP_MARGIN = UI_SIZES.spacing.minor;
const TOAST_PROGESS_ANIMATION_DELAY = 400; // Approximatively the duration of toast display anim.
const TOAST_PROGESS_ANIMATION_EASING = Easing.bezier(0.75, 1, 0.75, 1); // nearly linear but with a small slow down at the end
const TOAST_PROGESS_ANIMATION_START_VALUE = 1;
const TOAST_PROGESS_ANIMATION_END_VALUE = 0;

export const DEFAULTS = {
  offset: TOAST_TOP_MARGIN,
  visibilityTime: TOAST_DURATION + TOAST_PROGESS_ANIMATION_DELAY,
};

function useToastShades(type: ToastParams['type']) {
  return theme.palette.status[toastConfigColor[type]] as IShades;
}

function useToastProgress(duration: ToastParams['props']['duration'], colorShades: IShades) {
  const [progressWidth, setProgressWidth] = React.useState<number>(0);
  const measureProgressLayout = React.useCallback(({ nativeEvent }: { nativeEvent: LayoutChangeEvent['nativeEvent'] }) => {
    setProgressWidth(nativeEvent.layout.width);
  }, []);

  const progressValue = React.useRef(new Animated.Value(TOAST_PROGESS_ANIMATION_START_VALUE)).current;
  const progressTimeStart = React.useRef(0);
  const remainingTime = React.useRef(0);
  const progressAnimation = React.useMemo(
    () =>
      Animated.timing(progressValue, {
        delay: TOAST_PROGESS_ANIMATION_DELAY,
        duration: duration - TOAST_PROGESS_ANIMATION_DELAY,
        easing: TOAST_PROGESS_ANIMATION_EASING,
        toValue: TOAST_PROGESS_ANIMATION_END_VALUE,
        useNativeDriver: true,
      }),
    [duration, progressValue],
  );

  const translateX = React.useMemo(
    () =>
      progressValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-progressWidth / 2, 0],
      }),
    [progressValue, progressWidth],
  );

  const progressStyle = React.useMemo(
    () => [
      { backgroundColor: colorShades.light },
      styles.progress,
      {
        transform: [{ translateX }, { scaleX: progressValue }],
      },
    ],
    [colorShades.light, progressValue, translateX],
  );

  const onPause = React.useCallback(() => {
    progressValue.stopAnimation();
    Toast.pause();

    const elapsedTime = Date.now() - progressTimeStart.current;
    remainingTime.current = Math.max(0, remainingTime.current - elapsedTime);
  }, [progressValue]);

  const onResume = React.useCallback(() => {
    if (remainingTime.current <= 0) return;

    progressTimeStart.current = Date.now();

    Animated.timing(progressValue, {
      duration: remainingTime.current,
      easing: TOAST_PROGESS_ANIMATION_EASING,
      toValue: TOAST_PROGESS_ANIMATION_END_VALUE,
      useNativeDriver: true,
    }).start();

    Toast.resume();
  }, [progressValue]);

  // Will be triggered
  const onStart = React.useCallback(() => {
    if (!duration) return;
    progressAnimation.reset();
    progressAnimation.start();
    progressTimeStart.current = Date.now();
    remainingTime.current = duration;
  }, [duration, progressAnimation]);

  React.useEffect(() => {
    return () => {
      progressValue.stopAnimation();
    };
  }, [progressValue]);

  return { measureProgressLayout, onPause, onResume, onStart, progressStyle };
}

function ToastCard(params: ToastParams) {
  const colorShades = useToastShades(params.type);

  const onClose = React.useCallback(() => {
    ToastMessage.hide();
  }, []);

  const { measureProgressLayout, onPause, onResume, onStart, progressStyle } = useToastProgress(params.props.duration, colorShades);
  // Refresh start effect when toastId is renewed (= when new toast is triggered)
  React.useLayoutEffect(onStart, [onStart, params.props.toastId]);

  const innerToastComponent: AlertCardProps['renderCloseButton'] = React.useCallback(
    (shades, closeCallback?: () => void) =>
      params.props.duration ? (
        <Animated.View onLayout={measureProgressLayout} style={progressStyle} />
      ) : (
        <IconButton icon="ui-close" action={closeCallback!} />
      ),
    [measureProgressLayout, params.props.duration, progressStyle],
  );

  const containerProps = React.useMemo(
    () => ({
      onTouchEnd: onResume,
      onTouchStart: onPause,
      testID: params.props.testID,
    }),
    [onPause, onResume, params.props.testID],
  );

  return (
    <AlertCard
      type={params.type as AlertCardProps['type']}
      text={params.text1}
      label={params.text2}
      onLabelPress={params.props.onLabelPress}
      onClose={onClose}
      renderCloseButton={innerToastComponent}
      containerProps={containerProps}
      shadow
      style={styles.container}
      icon={params.props.picture}
      testID={params.props.testID}
    />
  );
}

const config: ToastConfig = {
  error: props => <ToastCard {...props} />,
  info: props => <ToastCard {...props} />,
  success: props => <ToastCard {...props} />,
  warning: props => <ToastCard {...props} />,
};

//
// Toast Containers
//

export function ToastContainer({ offset, ...props }: ToastProps) {
  const navBarHeight = useHeaderHeight();
  return <ToastMessage config={config} topOffset={offset ? DEFAULTS.offset + offset : navBarHeight + DEFAULTS.offset} {...props} />;
}

export function RootToastContainer(props: ToastProps) {
  const { top } = useSafeAreaInsets();
  return <ToastMessage config={config} topOffset={DEFAULTS.offset + top + UI_SIZES.elements.navbarHeight} {...props} />;
}
