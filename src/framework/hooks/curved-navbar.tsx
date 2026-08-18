import * as React from 'react';
import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';

const styles = StyleSheet.create({
  navBarSvgDecoration: {
    position: 'absolute',
  },
});

/**
 * Setup a fancy navBar decoration feature
 * That consists of adding a svg as a background that scroll with the page content
 * @returns the React Element of the decoration
 */
export function useCurvedNavBarFeature(svgDetails: {
  name: SvgIconName;
  height: number;
  width: number;
  // height of the svg file we need to withdraw from the view but still needed in positionning calculation
  // depends on the original dimensions and content of the svg file
  topOffset: number;
}) {
  // SVG size management
  const svgDisplayWidth = UI_SIZES.screen.width;
  const svgDisplayHeight = Math.ceil(svgDisplayWidth * (svgDetails.height / svgDetails.width));
  const svgDisplayTopOffset = svgDetails.topOffset * (svgDisplayWidth / svgDetails.width);
  // Math.ceil(navBarHeight * (svgDisplayWidth / useCurvedNavBarFeature.svgOriginalWidth)) -
  // svgDisplayHeight +
  // UI_SIZES.elements.statusbarHeight;
  // SVG size management

  return React.useMemo(() => {
    return (
      <Svg
        width={svgDisplayWidth}
        height={svgDisplayHeight}
        style={[styles.navBarSvgDecoration, { top: svgDisplayTopOffset }]}
        fill={theme.palette.primary.regular}
        name={svgDetails.name}
      />
    );
  }, [svgDetails.name, svgDisplayHeight, svgDisplayTopOffset, svgDisplayWidth]);
}
