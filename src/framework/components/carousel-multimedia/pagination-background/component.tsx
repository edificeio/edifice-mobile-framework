import React from 'react';

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import styles from './styles';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '~/framework/components/carousel-multimedia/styles';

const PaginationBackground = ({ isPortrait }: { isPortrait: boolean }) => {
  return (
    <Svg
      style={{
        ...styles.paginationGradientSvg,
        width: isPortrait ? SCREEN_WIDTH : SCREEN_HEIGHT,
      }}>
      <Defs>
        <LinearGradient id="paginationGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#paginationGradient)" />
    </Svg>
  );
};

export default PaginationBackground;
