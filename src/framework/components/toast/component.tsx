import { useRoute } from '@react-navigation/native';
import * as React from 'react';
import { Animated, Easing, LayoutChangeEvent, Platform, View } from 'react-native';
import ToastMessage, { ToastConfig } from 'react-native-toast-message';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

import theme, { IShades } from '~/app/theme';
import CloseButton from '~/framework/components//buttons/close';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { isModalModeOnThisRoute } from '~/framework/navigation/hideTabBarAndroid';

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
  visibilityTime: TOAST_DURATION + TOAST_PROGESS_ANIMATION_DELAY,
  offset: TOAST_TOP_MARGIN,
};

//
// Toast Component
//

const toastConfigColor = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'failure',
};

const toastDefaultPictureProps = {
  success: 'ui-success_outline',
  info: 'ui-infoCircle',
  warning: 'ui-alert-triangle',
  error: 'ui-error',
};

/**
 * Populates the given picture props with the right color shade and size
 * Works only for NamedSvg pictures for the moment
 * @param picture
 * @param shades
 * @returns the picture props with new members
 */
function autoFillPicture(picture: PictureProps, shades: IShades) {
  if (picture.type !== 'NamedSvg') return picture;
  return {
    ...picture,
    fill: picture.fill ?? shades.regular,
    width: picture.width !== undefined && picture.height !== undefined ? picture.width : UI_SIZES.elements.icon,
    height: picture.width !== undefined && picture.height !== undefined ? picture.height : UI_SIZES.elements.icon,
  };
}

function useToastStyles(type: ToastParams['type'], picture: ToastParams['props']['picture']) {
  const colorShades = theme.palette.status[toastConfigColor[type]] as IShades;
  const cardBorderStyle = React.useMemo(() => [{ backgroundColor: colorShades.regular }, styles.cardBorder], [colorShades.regular]);
  const cardContentStyle = React.useMemo(() => [{ borderColor: colorShades.pale }, styles.cardContent], [colorShades.pale]);
  const cardShadowContainerStyle = React.useMemo(
    () => [
      {
        backgroundColor: Platform.select({
          ios: colorShades.pale, // On iOS we set the coloured background to make pixel-perfect rounded corners.
          default: undefined, // Android sucks to render translucent views with subviews, we have to minimise backgrounded views.
        }),
      },
      styles.cardShadowContainer,
    ],
    [colorShades.pale],
  );
  const pictureWithColor = React.useMemo(
    () => ({
      ...(picture
        ? autoFillPicture(picture, colorShades)
        : ({
            type: 'NamedSvg',
            name: toastDefaultPictureProps[type],
            fill: colorShades.regular,
            width: UI_SIZES.elements.icon,
            height: UI_SIZES.elements.icon,
            // style: { backgroundColor: 'pink' },
          } as PictureProps)),
    }),
    [colorShades, picture, type],
  );

  return { colorShades, cardBorderStyle, cardContentStyle, cardShadowContainerStyle, pictureWithColor };
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
        toValue: TOAST_PROGESS_ANIMATION_END_VALUE,
        delay: TOAST_PROGESS_ANIMATION_DELAY,
        easing: TOAST_PROGESS_ANIMATION_EASING,
        duration: duration - TOAST_PROGESS_ANIMATION_DELAY,
        useNativeDriver: true,
      }),
    [duration, progressValue],
  );
  const progressStyle = React.useMemo(() => {
    return [
      { backgroundColor: colorShades.light },
      styles.progress,
      {
        transform: [{ translateX: -progressWidth / 2 }, { scaleX: progressValue }, { translateX: progressWidth / 2 }],
      },
    ];
  }, [colorShades.light, progressValue, progressWidth]);

  const onPause = React.useCallback(() => {
    progressAnimation.stop();
    Toast.pause();
    remainingTime.current = remainingTime.current - (Date.now() - progressTimeStart.current);
  }, [progressAnimation]);

  const onResume = React.useCallback(() => {
    progressTimeStart.current = Date.now();
    const progressResumeAnimation = Animated.timing(progressValue, {
      toValue: TOAST_PROGESS_ANIMATION_END_VALUE,
      easing: TOAST_PROGESS_ANIMATION_EASING,
      duration: remainingTime.current,
      useNativeDriver: true,
    });
    progressResumeAnimation.start();
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

  return { onStart, onPause, onResume, measureProgressLayout, progressStyle };
}

function ToastCard(params: ToastParams) {
  const { colorShades, cardBorderStyle, cardContentStyle, cardShadowContainerStyle, pictureWithColor } = useToastStyles(
    params.type,
    params.props.picture,
  );

  const { onStart, onPause, onResume, measureProgressLayout, progressStyle } = useToastProgress(params.props.duration, colorShades);

  // Refresh start effect when toastId is renewed (= when new toast is triggered)
  React.useLayoutEffect(onStart, [onStart, params.props.toastId]);

  const onClose = React.useCallback(() => {
    ToastMessage.hide();
  }, []);

  const cardContent = React.useMemo(
    () => (
      <>
        <Picture {...pictureWithColor} />
        <SmallText style={styles.cardText}>{params.text1}</SmallText>
        {params.text2 && params.props.onLabelPress ? (
          <TertiaryButton text={params.text2} action={params.props.onLabelPress} />
        ) : null}
        {params.props.duration ? (
          <Animated.View onLayout={measureProgressLayout} style={progressStyle} />
        ) : (
          <CloseButton action={onClose} />
        )}
      </>
    ),
    [
      measureProgressLayout,
      onClose,
      params.props.duration,
      params.props.onLabelPress,
      params.text1,
      params.text2,
      pictureWithColor,
      progressStyle,
    ],
  );

  // ToDo : this component can be extracted to a presentation component
  return (
    <View style={cardShadowContainerStyle} onTouchStart={onPause} onTouchEnd={onResume}>
      {/* must decompose card and shadow because of overflow:hidden */}
      <View style={styles.card}>
        <View style={cardBorderStyle} />
        <View style={cardContentStyle}>{cardContent}</View>
      </View>
    </View>
  );
}

const config: ToastConfig = {
  success: props => <ToastCard {...props} />,
  warning: props => <ToastCard {...props} />,
  info: props => <ToastCard {...props} />,
  error: props => <ToastCard {...props} />,
};

//
// Toast Containers
//

const defaultRootScreenOffset = UI_SIZES.elements.navbarHeight + (UI_SIZES.screen.topInset || UI_SIZES.elements.statusbarHeight);

function useToastOffset(customOffset?: number) {
  const route = useRoute();
  if (customOffset) return customOffset;
  const isModal = isModalModeOnThisRoute(route.name);
  return isModal
    ? DEFAULTS.offset // On modal screens, zero is below the navBar
    : DEFAULTS.offset + defaultRootScreenOffset; // Anywhere else, zero is the very top of screen
}

export function ToastHandler(props: ToastProps) {
  const offset = useToastOffset(props.offset);
  return <ToastMessage config={config} topOffset={offset} {...props} />;
}

export function RootToastHandler(props: ToastProps) {
  return <ToastMessage config={config} topOffset={props.offset ?? DEFAULTS.offset + defaultRootScreenOffset} />; // For the global Toast, zero is the very top of screen
}
