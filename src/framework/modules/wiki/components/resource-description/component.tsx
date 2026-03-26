import React from 'react';
import { Pressable, TextLayoutEvent, View } from 'react-native';

import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

import {
  CARD_EXPANDED_MARGIN_BOTTOM,
  CARD_EXPANDED_MARGIN_TOP,
  CARD_UNEXPANDED_MARGIN_BOTTOM,
  CARD_UNEXPANDED_MARGIN_TOP,
  styles,
} from './styles';
import { ExpandButtonProps, ResourceDescriptionProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText, SmallBoldText } from '~/framework/components/text';
import { useLayout } from '~/framework/hooks/layout';

const DEFAULT_NUMBER_OF_LINES = 3;

const ExpandButton = React.forwardRef<View, ExpandButtonProps>(({ isExpanded }, ref) => {
  return (
    <View ref={ref} style={isExpanded ? styles.expandedButton : styles.unexpandedButton} testID="wiki-expansion-indicator">
      <SmallBoldText style={styles.expandButtonText}>
        {I18n.get(isExpanded ? 'textpreview-seeless' : 'textpreview-seemore')}
      </SmallBoldText>
      <Svg
        name={isExpanded ? 'ui-rafterUp' : 'ui-rafterDown'}
        width={UI_SIZES.elements.icon.xsmall}
        height={UI_SIZES.elements.icon.xsmall}
        fill={theme.palette.grey.graphite}
      />
    </View>
  );
});

const ResourceDescription: React.FC<ResourceDescriptionProps> = ({
  content = '',
  expanded = false,
  numberOfLines = DEFAULT_NUMBER_OF_LINES,
  onPress,
}: ResourceDescriptionProps) => {
  const expandRef = React.useRef<View>(null);
  const containerRef = React.useRef<View>(null);

  const [fullTextLayout, setFullTextLayout] = React.useState<TextLayoutEvent['nativeEvent'] | null>(null);
  const fullTextHeight = React.useMemo(
    () => (fullTextLayout ? fullTextLayout?.lines.length * fullTextLayout?.lines[0].height : undefined),
    [fullTextLayout],
  );
  const reducedTextHeight = React.useMemo(
    () => (fullTextLayout ? Math.min(fullTextLayout?.lines.length, numberOfLines) * fullTextLayout?.lines[0].height : undefined),
    [fullTextLayout, numberOfLines],
  );
  const isExpandable = fullTextLayout?.lines.length ? fullTextLayout?.lines.length > numberOfLines : undefined;
  const onTextLayout = React.useCallback(({ nativeEvent }: TextLayoutEvent) => {
    setFullTextLayout(nativeEvent);
  }, []);

  const expandLayout = useLayout(expandRef);

  const displayedContent = React.useMemo(() => {
    if (fullTextLayout && isExpandable && !expanded) {
      return (
        <>
          {fullTextLayout.lines.slice(0, numberOfLines).map((line, index) => (
            <BodyText
              key={line.y}
              numberOfLines={1}
              style={index === numberOfLines - 1 ? { marginRight: expandLayout?.width } : undefined}>
              {line.text}
            </BodyText>
          ))}
        </>
      );
    } else return <BodyText onTextLayout={onTextLayout}>{content}</BodyText>;
  }, [content, expandLayout?.width, expanded, fullTextLayout, isExpandable, numberOfLines, onTextLayout]);

  const height = useSharedValue<number>(0);
  const marginTop = useSharedValue<number>(expanded ? CARD_EXPANDED_MARGIN_TOP : CARD_UNEXPANDED_MARGIN_TOP);
  const marginBottom = useSharedValue<number>(expanded ? CARD_EXPANDED_MARGIN_BOTTOM : CARD_UNEXPANDED_MARGIN_BOTTOM);
  const getNewHeight = React.useCallback(
    (expand: boolean, fullHeight: number, expendHeight: number, reducedHeight: number) =>
      (expand ? fullHeight + expendHeight : reducedHeight) + styles.cardContainer.padding * 2,
    [],
  );
  const isReady = fullTextHeight && expandLayout?.height && reducedTextHeight;
  if (height.value === 0 && isReady) {
    height.value = getNewHeight(expanded, fullTextHeight, expandLayout?.height, reducedTextHeight);
  }

  const animatedStyle = React.useMemo(() => {
    return { height, marginBottom, marginTop };
  }, [height, marginBottom, marginTop]);

  const animate = React.useCallback(
    (expand: boolean) => {
      if (fullTextHeight === undefined || expandLayout?.height === undefined || reducedTextHeight === undefined) return;
      height.value = withSpring(getNewHeight(expand, fullTextHeight, expandLayout?.height, reducedTextHeight));
      marginTop.value = withSpring(expand ? CARD_EXPANDED_MARGIN_TOP : CARD_UNEXPANDED_MARGIN_TOP);
      marginBottom.value = withSpring(expand ? CARD_EXPANDED_MARGIN_BOTTOM : CARD_UNEXPANDED_MARGIN_BOTTOM);
    },
    [expandLayout?.height, fullTextHeight, getNewHeight, height, marginBottom, marginTop, reducedTextHeight],
  );

  const onToggle = React.useCallback(() => {
    onPress?.(!expanded);
    animate(!expanded);
  }, [animate, expanded, onPress]);

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]} testID={'wiki-description'}>
      <Pressable onPress={onToggle} disabled={!isExpandable}>
        <Animated.View ref={containerRef}>
          {displayedContent}
          {isExpandable !== false && <ExpandButton ref={expandRef} isExpanded={expanded} />}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default ResourceDescription;
