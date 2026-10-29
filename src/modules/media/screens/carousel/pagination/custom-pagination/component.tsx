import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { TouchableWithoutFeedback, View } from 'react-native';

import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import styles from './styles';
import { DotStyle } from './types';

const DEFAULT_DOT_SIZE = 10;

type CustomStyleFn = (progress: number, index: number, length: number) => ViewStyle;

type PaginationDotProps = React.PropsWithChildren<{
  activeDotStyle?: DotStyle;
  count: number;
  customReanimatedStyle?: CustomStyleFn;
  dotStyle?: DotStyle;
  index: number;
  loop: boolean;
  onPress?: () => void;
  progress: SharedValue<number>;
  size?: number;
}>;

const PaginationDot = ({
  activeDotStyle,
  children,
  count,
  customReanimatedStyle,
  dotStyle,
  index,
  loop,
  onPress,
  progress,
  size,
}: PaginationDotProps) => {
  const animStyle = useAnimatedStyle(() => {
    const {
      backgroundColor = '#FFF',
      borderRadius,
      height = size ?? DEFAULT_DOT_SIZE,
      width = size ?? DEFAULT_DOT_SIZE,
      ...restDotStyle
    } = dotStyle ?? {};
    const {
      backgroundColor: activeBackgroundColor = '#000',
      borderRadius: activeBorderRadius,
      height: activeHeight = height,
      width: activeWidth = width,
      ...restActiveDotStyle
    } = activeDotStyle ?? {};

    // v5 loop progress is unbounded and continuous — normalise back into [0, count)
    const raw = progress.value;
    const p = loop ? ((raw % count) + count) % count : raw;

    let val = Math.abs(p - index);
    if (index === 0 && p > count - 1) {
      val = Math.abs(p - count);
    }

    const inputRange = [0, 1, 2];
    const restStyle = (val === 0 ? restActiveDotStyle : restDotStyle) ?? {};
    const customStyle = customReanimatedStyle?.(p, index, count) ?? {};

    return {
      backgroundColor: interpolateColor(val, inputRange, [activeBackgroundColor, backgroundColor, backgroundColor]),
      borderRadius: interpolate(
        val,
        inputRange,
        [activeBorderRadius ?? borderRadius ?? 0, borderRadius ?? 0, borderRadius ?? 0],
        Extrapolation.CLAMP,
      ),
      height: interpolate(val, inputRange, [activeHeight, height, height], Extrapolation.CLAMP),
      width: interpolate(val, inputRange, [activeWidth, width, width], Extrapolation.CLAMP),
      ...restStyle,
      ...customStyle,
      transform: [...((restStyle?.transform ?? []) as never[]), ...((customStyle?.transform ?? []) as never[])],
    };
  });

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View style={[styles.item, dotStyle, animStyle]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
};

type CustomPaginationProps<T> = {
  activeDotStyle?: DotStyle;
  containerStyle?: StyleProp<ViewStyle>;
  customReanimatedStyle?: CustomStyleFn;
  data: T[];
  dotStyle?: DotStyle;
  loop?: boolean;
  onPress?: (index: number) => void;
  progress: SharedValue<number>;
  renderItem?: (item: T, index: number) => React.ReactNode;
  size?: number;
};

export const CustomPagination = <T,>({
  activeDotStyle,
  containerStyle,
  customReanimatedStyle,
  data,
  dotStyle,
  loop = false,
  onPress,
  progress,
  renderItem,
  size,
}: CustomPaginationProps<T>) => (
  <View style={[styles.container, containerStyle]}>
    {data.map((item, index) => (
      <PaginationDot
        activeDotStyle={activeDotStyle}
        count={data.length}
        customReanimatedStyle={customReanimatedStyle}
        dotStyle={dotStyle}
        index={index}
        key={index}
        loop={loop}
        onPress={onPress ? () => onPress(index) : undefined}
        progress={progress}
        size={size}>
        {renderItem?.(item, index)}
      </PaginationDot>
    ))}
  </View>
);
