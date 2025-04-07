import * as React from 'react';
import { Animated, Easing, useAnimatedValue, View, ViewProps } from 'react-native';

import RNSvg, { ClipPath, Line, Linecap, Path, Rect, VectorEffect } from 'react-native-svg';

import { styles } from './styles';
import { HeaderStatus, PageHeaderProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture/svg';
import { SmallBoldText } from '~/framework/components/text';

const commonSvgBackgroundProps = {
  fill: theme.palette.grey.fog,
  stroke: theme.palette.grey.pearl,
  strokeDasharray: '6 6',
  strokeLinecap: 'round' as const,
  strokeWidth: `${UI_SIZES.border.small}px`,
  vectorEffect: 'non-scaling-stroke' as const,
};
const VECTOR_EFFECT: VectorEffect = 'non-scaling-stroke';
const STROKE_LINE_CAP: Linecap = 'round';

const commonSvgLineProps = {
  stroke: theme.palette.complementary.blue.light,
  strokeDasharray: '6 6',
  strokeLinecap: STROKE_LINE_CAP,
  strokeWidth: `${UI_SIZES.border.small * 2}px`,
  vectorEffect: VECTOR_EFFECT,
  x1: 0,
  x2: 375,
};

const SvgBackground = ({ height = '100%' }: { height?: number | string }) => (
  <>
    <RNSvg width="100%" height={height} viewBox="0 0 375 164">
      <Path d="M-7.5 -5H52.5L-67.5 169H-127.5L-7.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M82.5 -5H142.5L22.5 169H-37.5L82.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M172.5 -5H232.5L112.5 169H52.5L172.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M262.5 -5H322.5L202.5 169H142.5L262.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M352.5 -5H412.5L292.5 169H232.5L352.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M442.5 -5H502.5L382.5 169H322.5L442.5 -5Z" {...commonSvgBackgroundProps} />
    </RNSvg>
  </>
);

const SvgUpperLine = () => (
  <RNSvg width="100%" height="2px" viewBox="0 0 375 2" preserveAspectRatio="none" style={styles.svgUpperLine}>
    <Line y1={2} y2={2} {...commonSvgLineProps} />
  </RNSvg>
);

const SvgLowerLine = () => (
  <RNSvg width="100%" height="2px" viewBox="0 0 375 2" preserveAspectRatio="none" style={styles.svgLowerLine}>
    <Line y1={0} y2={0} {...commonSvgLineProps} />
  </RNSvg>
);
const VisibilityIndicator = () => (
  <View style={styles.visibilityIndicator}>
    <View style={styles.visibilityIndicatorInner}>
      <View style={styles.visibilityIconContainer}>
        <Svg
          fill={theme.palette.complementary.blue.regular}
          name="ui-hide"
          height={UI_SIZES.elements.icon.xsmall}
          width={UI_SIZES.elements.icon.xsmall}
        />
      </View>
      <SmallBoldText style={styles.visibilityIndicatorText}>{I18n.get('wiki-page-hidden')}</SmallBoldText>
    </View>
    <View style={styles.visibilityIndicatorBorder}>
      <RNSvg width="100%" height="100%" fill="none" preserveAspectRatio="none">
        <ClipPath id="mask">
          <Rect x="0%" y="-100%" width="100%" height="200%" rx="8" ry="8" />
        </ClipPath>
        <Rect
          x="0%"
          y="-100%"
          width="100%"
          height="200%"
          rx={styles.visibilityIndicator.borderBottomLeftRadius}
          ry={styles.visibilityIndicator.borderBottomLeftRadius}
          stroke={theme.palette.complementary.blue.light}
          strokeWidth={`${UI_SIZES.border.small * 2}px`}
          strokeLinecap="round"
          strokeDasharray="6 6"
          strokeDashoffset="2"
          vectorEffect="non-scaling-stroke"
          clipPath="url(#mask)"
        />
      </RNSvg>
    </View>
  </View>
);

const getPaddingTop: (status?: HeaderStatus) => number = status =>
  status === HeaderStatus.VISIBLE
    ? UI_SIZES.spacing.medium
    : UI_SIZES.spacing.medium +
      /**/ UI_SIZES.elements.icon.xsmall +
      /**/ styles.visibilityIndicatorInner.paddingBottom +
      /**/ styles.visibilityIndicatorInner.paddingTop;

const getMarginVertical: (status?: HeaderStatus) => number = status =>
  status === HeaderStatus.VISIBLE ? -UI_SIZES.border.thin : -UI_SIZES.border.small;

const animationConfig = {
  ...UI_ANIMATIONS.fade,
  Easing: Easing.out(Easing.ease),
};

const PageHeader: React.FC<PageHeaderProps> = ({ children, status }) => {
  const hiddenOpacity = useAnimatedValue(status === HeaderStatus.VISIBLE ? 0 : 1);
  const animatedPaddingTop = useAnimatedValue(getPaddingTop(status));
  const animatedMarginVertical = useAnimatedValue(getMarginVertical(status));

  const visibleHeaderStyle: ViewProps['style'] = React.useMemo(
    () => [styles.backgroundContainer, styles.backgroundContainerVisible],
    [],
  );

  const hiddenHeaderStyle: ViewProps['style'] = React.useMemo(
    () => [styles.backgroundContainer, styles.backgroundContainerHidden, { opacity: hiddenOpacity }],
    [hiddenOpacity],
  );

  const hiddenIndicatorStyle: ViewProps['style'] = React.useMemo(
    () => ({
      ...styles.visibilityIndicatorContainer,
      opacity: hiddenOpacity,
    }),
    [hiddenOpacity],
  );

  const containerStyle = React.useMemo(
    () => ({
      ...styles.container,
      marginVertical: animatedMarginVertical,
      paddingTop: animatedPaddingTop,
    }),
    [animatedPaddingTop, animatedMarginVertical],
  );

  const animateCard = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(hiddenOpacity, {
        ...animationConfig,
        toValue: status === HeaderStatus.VISIBLE ? 0 : 1,
      }),
      Animated.timing(animatedPaddingTop, {
        ...animationConfig,
        toValue: getPaddingTop(status),
      }),
      Animated.timing(animatedMarginVertical, {
        ...animationConfig,
        toValue: getMarginVertical(status),
      }),
    ]).start();
  }, [animatedMarginVertical, animatedPaddingTop, hiddenOpacity, status]);

  React.useLayoutEffect(() => {
    animateCard();
  }, [animateCard, status]);

  const [measuredHeight, setMeasuredHeight] = React.useState<number | undefined>(undefined);

  const onLayout = React.useCallback(
    (event: any) => {
      const { height } = event.nativeEvent.layout;
      setMeasuredHeight(height + UI_SIZES.spacing.medium + getPaddingTop(HeaderStatus.HIDDEN) - 2 * UI_SIZES.border.small);
    },
    [setMeasuredHeight],
  );

  return (
    <Animated.View style={containerStyle}>
      <Animated.View style={visibleHeaderStyle} />
      <Animated.View style={hiddenHeaderStyle}>
        <View style={styles.backgroundPatternContainer}>
          <SvgBackground height={measuredHeight} />
        </View>
        <SvgUpperLine />
        <SvgLowerLine />
      </Animated.View>
      <Animated.View style={hiddenIndicatorStyle}>
        <VisibilityIndicator />
      </Animated.View>
      <View onLayout={onLayout}>{children}</View>
    </Animated.View>
  );
};

export default PageHeader;
