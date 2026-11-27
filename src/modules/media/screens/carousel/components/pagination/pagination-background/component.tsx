import React from 'react';

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import theme from '~/app/theme';

import styles from './styles';

const PaginationBackground = ({ height, width }: { height: number; width: number }) => {
  return (
    <Svg style={styles.paginationGradientSvg} width={width} height={height}>
      <Defs>
        <LinearGradient id="paginationGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.palette.grey.darkness} stopOpacity="0.5" />
          <Stop offset="1" stopColor={theme.palette.grey.darkness} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#paginationGradient)" />
    </Svg>
  );
};

export default PaginationBackground;
