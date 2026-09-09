import * as React from 'react';
import { LayoutChangeEvent, View } from 'react-native';

import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, CaptionItalicText, HeadingSText } from '~/framework/components/text';
import AuthorLine from '~/framework/modules/communities/components/discussions/author-line';
import DiscussionStatusTab from '~/framework/modules/communities/components/discussions/status-tab';
import { DISCUSSION_TYPE_CONFIG } from '~/framework/modules/communities/utils';
import { formatDateConvivialHourless } from '~/framework/util/date';

import styles, {
  COLLAPSIBLE_AREA_WITH_STATUS_STYLE,
  COLLAPSIBLE_SMALL_HEIGHT,
  DATE_FADE_END,
  ICON_BIG_SIZE,
  ICON_OVERFLOW,
  ICON_SCALE,
  ICON_SMALL_TOP,
  SMALL_AUTHOR_TOP,
  TEXT_LEFT_BIG,
  TEXT_LEFT_SMALL,
  TITLE_FADE_IN_START,
  TITLE_FADE_OUT_END,
  TITLE_RISE,
  TYPE_STYLES,
} from './styles';
import { DiscussionHeaderProps } from './types';

const TITLE_NUMBER_OF_LINES = 3;
const FALLBACK_TYPE = DiscussionIcon.DISCUSSION;
const COLLAPSED_THRESHOLD = 0.5;

const DiscussionHeader = ({
  authorName,
  authorProfile,
  collapse,
  createdAt,
  status,
  title,
  type,
}: Readonly<DiscussionHeaderProps>) => {
  const { bandHeight, collapsibleHeight, onLayoutChange, progress } = collapse;
  const safeType = type in DISCUSSION_TYPE_CONFIG ? type : FALLBACK_TYPE;
  const typeConfig = DISCUSSION_TYPE_CONFIG[safeType];
  const typeStyles = TYPE_STYLES[safeType];

  const authorAndDateHeight = useSharedValue(0);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const measured = React.useRef({ collapsibleArea: 0, headerContent: 0 });
  const reportLayout = React.useCallback(() => {
    const { collapsibleArea, headerContent } = measured.current;
    if (!collapsibleArea || !headerContent) return;
    onLayoutChange(headerContent + UI_SIZES.border.thin, collapsibleArea);
  }, [onLayoutChange]);

  const onHeaderContentLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      measured.current.headerContent = event.nativeEvent.layout.height;
      reportLayout();
    },
    [reportLayout],
  );

  const onCollapsibleAreaLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      measured.current.collapsibleArea = event.nativeEvent.layout.height;
      reportLayout();
    },
    [reportLayout],
  );

  const onAuthorAndDateLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      authorAndDateHeight.value = event.nativeEvent.layout.height;
    },
    [authorAndDateHeight],
  );

  const bandStyle = useAnimatedStyle(() => {
    const distance = Math.max(collapsibleHeight.value - COLLAPSIBLE_SMALL_HEIGHT, 0);
    return { height: Math.max(bandHeight.value - distance * progress.value, 0) };
  });

  const titleBigStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, TITLE_FADE_OUT_END], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -TITLE_RISE], Extrapolation.CLAMP) }],
  }));

  const titleSmallStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [TITLE_FADE_IN_START, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const dateStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, DATE_FADE_END], [1, 0], Extrapolation.CLAMP),
  }));

  const authorBoldStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const authorRegularStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const iconStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, ICON_SCALE], Extrapolation.CLAMP);
    const shrinkOffset = (ICON_BIG_SIZE * (1 - scale)) / 2;
    const layoutTop = collapsibleHeight.value + ICON_OVERFLOW - ICON_BIG_SIZE;
    const targetTop = interpolate(progress.value, [0, 1], [layoutTop, ICON_SMALL_TOP], Extrapolation.CLAMP);
    return {
      transform: [{ translateX: -shrinkOffset }, { translateY: targetTop - layoutTop - shrinkOffset }, { scale }],
    };
  });

  const authorAndDateStyle = useAnimatedStyle(() => {
    const layoutTop = collapsibleHeight.value + ICON_OVERFLOW - authorAndDateHeight.value;
    return {
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, TEXT_LEFT_SMALL - TEXT_LEFT_BIG], Extrapolation.CLAMP) },
        { translateY: interpolate(progress.value, [0, 1], [0, SMALL_AUTHOR_TOP - layoutTop], Extrapolation.CLAMP) },
      ],
    };
  });

  useAnimatedReaction(
    () => progress.value > COLLAPSED_THRESHOLD,
    (current, previous) => {
      if (current !== previous) scheduleOnRN(setIsCollapsed, current);
    },
  );

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View style={[typeStyles.band, bandStyle]} />
      <View onLayout={onHeaderContentLayout} style={styles.headerContent}>
        <DiscussionStatusTab status={status} type={safeType} />
        <View onLayout={onCollapsibleAreaLayout} style={status ? COLLAPSIBLE_AREA_WITH_STATUS_STYLE : styles.collapsibleArea}>
          <Animated.View
            accessibilityElementsHidden={isCollapsed}
            importantForAccessibility={isCollapsed ? 'no-hide-descendants' : 'auto'}
            style={[styles.titleBig, titleBigStyle]}>
            <HeadingSText ellipsizeMode="tail" numberOfLines={TITLE_NUMBER_OF_LINES}>
              {title}
            </HeadingSText>
          </Animated.View>
          <Animated.View style={[typeStyles.iconSquare, iconStyle]}>
            <Svg
              fill={typeConfig.color.regular}
              height={UI_SIZES.elements.icon.default}
              name={typeConfig.icon}
              width={UI_SIZES.elements.icon.default}
            />
          </Animated.View>
          <Animated.View style={[styles.authorAndDateColumn, authorAndDateStyle]}>
            <View onLayout={onAuthorAndDateLayout} style={styles.authorAndDateContent}>
              <View>
                <Animated.View style={authorBoldStyle}>
                  <AuthorLine name={authorName} profile={authorProfile} />
                </Animated.View>
                <Animated.View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={[styles.authorRegular, authorRegularStyle]}>
                  <AuthorLine bold={false} name={authorName} profile={authorProfile} />
                </Animated.View>
              </View>
              <Animated.View
                accessibilityElementsHidden={isCollapsed}
                importantForAccessibility={isCollapsed ? 'no-hide-descendants' : 'auto'}
                style={dateStyle}>
                <CaptionItalicText style={styles.date}>
                  {createdAt ? formatDateConvivialHourless(createdAt) : I18n.get('date-invalid')}
                </CaptionItalicText>
              </Animated.View>
            </View>
          </Animated.View>
          <Animated.View
            accessibilityElementsHidden={!isCollapsed}
            importantForAccessibility={isCollapsed ? 'auto' : 'no-hide-descendants'}
            style={[styles.titleSmall, titleSmallStyle]}>
            <BodyBoldText ellipsizeMode="tail" numberOfLines={1}>
              {title}
            </BodyBoldText>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default React.memo(DiscussionHeader);
