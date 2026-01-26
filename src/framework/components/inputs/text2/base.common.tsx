import React from 'react';
import { type ViewStyle } from 'react-native';

import Svg, { Defs, LinearGradient, LinearGradientProps, Rect, Stop } from 'react-native-svg';

import defaultStyles from './style';

/**
 * Gradient component for showing fade-style ellipsis of a scrollable TextArea.
 */
export const GradientSvgDeco = ({
  color,
  style,
  y1,
  y2,
}: LinearGradientProps & { style?: ViewStyle; color: ViewStyle['backgroundColor'] }) => (
  <Svg style={React.useMemo(() => [defaultStyles.deco, style], [style])}>
    <Defs>
      <LinearGradient id="backgroundGradient" x1={0} y1={y1} x2={0} y2={y2}>
        <Stop offset="0" stopColor={color} stopOpacity={1} />
        <Stop offset="0.2" stopColor={color} stopOpacity={0.9} />
        <Stop offset="0.8" stopColor={color} stopOpacity={0.1} />
        <Stop offset="1" stopColor={color} stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <Rect x="0%" y="0%" width="100%" height="100%" fill="url(#backgroundGradient)" />
  </Svg>
);

/**
 * TextAreas with scrollable content show gradients at the top & the bottom.
 */
export const TextAreaDecoration = ({ color }: { color: ViewStyle['backgroundColor'] }) => (
  <>
    <GradientSvgDeco y1={0} y2={1} style={defaultStyles.decoTop} color={color} />
    <GradientSvgDeco y1={1} y2={0} style={defaultStyles.decoBottom} color={color} />
  </>
);

/**
 * Compute a rounded threshold from a given value.
 * The result is X% of the value rounded to the first significative digit.
 * Example : Given a value of 811, with a ratio of 0.75, the result will be 600 (75% of 800).
 * @param value from which value compute the threshold
 * @param ratio at wich ratio the threshold will be computed. Default is 75%
 * @returns
 */
const getThreshold = (value: number, ratio: number) => {
  const threshold = value * ratio;
  const digits = Math.floor(Math.log10(threshold));
  return Math.floor(threshold / Math.pow(10, digits)) * Math.pow(10, digits);
};

const getThresholdStr = (value: number, maxLength: number) => `${value}/${maxLength}`;

/**
 * MaxLength handling with printing character count and limit.
 * Return the printable text & a boolean that goes true if limit is reached.
 * Styling this text is up to the component.
 * @param valueLength length of the user's content
 * @param maxLength self-explaining
 * @param displayRatio Percent of the total from which displaying the char count & limit. Default is 75%. Value will be rounded to the first significative digit
 * @returns
 */
export const useMaxLength = (valueLength: number, maxLength?: number, displayRatio: number = 3 / 4) => {
  const threshold = React.useMemo(() => maxLength && getThreshold(maxLength, displayRatio), [maxLength, displayRatio]);
  const isLimitReached = maxLength && (valueLength ?? 0) >= maxLength;
  const thresholdCrossed = !!(threshold && valueLength >= threshold);
  return { isLimitReached, text: maxLength && thresholdCrossed ? getThresholdStr(valueLength, maxLength) : null };
};
