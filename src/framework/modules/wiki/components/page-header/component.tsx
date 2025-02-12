import * as React from 'react';
import { Animated, View, ViewStyle } from 'react-native';

import Svg, { ClipPath, Line, Path, Rect } from 'react-native-svg';

import { styles } from './styles';
import { HeaderStatus, PageHeaderProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { Svg as CustomSvg } from '~/framework/components/picture/svg';
import { SmallBoldText } from '~/framework/components/text';

const commonSvgBackgroundProps = {
  fill: theme.palette.grey.fog,
  stroke: theme.palette.grey.pearl,
  strokeDasharray: '6 6',
  strokeLinecap: 'round' as const,
  strokeWidth: `${UI_SIZES.border.small}px`,
  vectorEffect: 'non-scaling-stroke' as const,
};

const VISIBLE_HEADER_HEIGHT = getScaleWidth(142);
const MASKED_HEADER_HEIGHT = getScaleWidth(164);

const SvgBackground = () => (
  <>
    <Svg width="100%" height="100%" viewBox="0 0 375 164" style={styles.svgBackground}>
      <Path d="M-7.5 -5H52.5L-67.5 169H-127.5L-7.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M82.5 -5H142.5L22.5 169H-37.5L82.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M172.5 -5H232.5L112.5 169H52.5L172.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M262.5 -5H322.5L202.5 169H142.5L262.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M352.5 -5H412.5L292.5 169H232.5L352.5 -5Z" {...commonSvgBackgroundProps} />
      <Path d="M442.5 -5H502.5L382.5 169H322.5L442.5 -5Z" {...commonSvgBackgroundProps} />
    </Svg>
  </>
);

const SvgUpperLine = () => (
  <Svg width="100%" height="2px" viewBox="0 0 375 2" preserveAspectRatio="none">
    <Line
      x1="0"
      x2={375}
      y1={2}
      y2={2}
      stroke={theme.palette.complementary.blue.light}
      strokeWidth={`${UI_SIZES.border.small * 2}px`}
      strokeLinecap="round"
      strokeDasharray="6 6"
      vectorEffect="non-scaling-stroke"
    />
  </Svg>
);

const SvgLowerLine = () => (
  <Svg width="100%" height="2px" viewBox="0 0 375 2" preserveAspectRatio="none">
    <Line
      x1="0"
      x2={375}
      y1={0}
      y2={0}
      stroke={theme.palette.complementary.blue.light}
      strokeWidth={`${UI_SIZES.border.small * 2}px`}
      strokeLinecap="round"
      strokeDasharray="6 6"
      vectorEffect="non-scaling-stroke"
    />
  </Svg>
);
const VisibilityIndicator = () => (
  <View style={styles.visibilityIndicatorContainer}>
    <View style={styles.visibilityIndicatorInner}>
      <CustomSvg
        fill={theme.palette.complementary.blue.regular}
        name="ui-hide"
        height={UI_SIZES.elements.icon.xsmall}
        width={UI_SIZES.elements.icon.xsmall}
      />
      <SmallBoldText style={{ color: theme.palette.complementary.blue.regular }}>
        {I18n.get('wiki-page-header-hidden-status')}
      </SmallBoldText>
    </View>
    <Svg width="100%" height="100%" fill="none" preserveAspectRatio="none" style={styles.visibilityIndicatorBorder}>
      <ClipPath id="mask">
        <Rect x="0%" y="-100%" width="100%" height="200%" rx="8" ry="8" />
      </ClipPath>
      <Rect
        x="0%"
        y="-100%"
        width="100%"
        height="200%"
        rx="8"
        ry="8"
        stroke={theme.palette.complementary.blue.light}
        strokeWidth={`${UI_SIZES.border.small * 2}px`}
        strokeLinecap="round"
        strokeDasharray="6 6"
        strokeDashoffset="2"
        vectorEffect="non-scaling-stroke"
        clipPath="url(#mask)"
      />
    </Svg>
  </View>
);

const PageHeader: React.FC<PageHeaderProps> = ({ children, status }) => {
  const headerHeight = React.useRef(new Animated.Value(VISIBLE_HEADER_HEIGHT)).current;
  const visibleOpacity = React.useRef(new Animated.Value(status === HeaderStatus.VISIBLE ? 1 : 0)).current;
  const maskedOpacity = React.useRef(new Animated.Value(status === HeaderStatus.VISIBLE ? 0 : 1)).current;

  const animationConfig = React.useMemo(
    () => ({
      duration: 300,
      // Easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }),
    [],
  );

  const visibleHeaderStyle: ViewStyle = React.useMemo(
    () => ({
      height: headerHeight,
      opacity: visibleOpacity,
      position: 'absolute',
      width: '100%',
      zIndex: 2,
    }),
    [headerHeight, visibleOpacity],
  );

  const maskedHeaderStyle: ViewStyle = React.useMemo(
    () => ({
      height: headerHeight,
      opacity: maskedOpacity,
      position: 'absolute',
      width: '100%',
      zIndex: 1,
    }),
    [headerHeight, maskedOpacity],
  );

  const animateCard = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(maskedOpacity, {
        ...animationConfig,
        toValue: status === HeaderStatus.VISIBLE ? 0 : 1,
      }),
      Animated.timing(visibleOpacity, {
        ...animationConfig,
        toValue: status === HeaderStatus.VISIBLE ? 1 : 0,
      }),
      Animated.timing(headerHeight, {
        ...animationConfig,
        toValue: status === HeaderStatus.VISIBLE ? VISIBLE_HEADER_HEIGHT : MASKED_HEADER_HEIGHT,
      }),
    ]).start();
  }, [headerHeight, animationConfig, status, visibleOpacity, maskedOpacity]);

  const VisiblePageHeader = React.useMemo(() => {
    return <></>;
  }, []);

  const MaskedPageHeader = React.useMemo(() => {
    return (
      <>
        <SvgUpperLine />
        <View style={styles.headerContainerHidden}>
          <View style={styles.backgroundContainer}>
            <SvgBackground />
            <VisibilityIndicator />
          </View>
        </View>
        <SvgLowerLine />
      </>
    );
  }, []);

  React.useEffect(() => {
    animateCard();
  }, [animateCard, status]);

  return (
    <View style={styles.container}>
      <Animated.View style={maskedHeaderStyle}>{MaskedPageHeader}</Animated.View>
      <Animated.View style={visibleHeaderStyle}>{VisiblePageHeader}</Animated.View>
      <View
        style={[
          styles.contentContainer,
          status === HeaderStatus.VISIBLE ? styles.headerContainerVisible : styles.headerContainerHiddenInner,
        ]}>
        {children}
      </View>
    </View>
  );
};

export default PageHeader;
