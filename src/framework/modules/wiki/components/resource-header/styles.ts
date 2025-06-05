import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

// valeurs maquettes
const SVG_SHAPE_RIGHT_POSITION_TOP = getScaleWidth(104);
const SVG_SHAPE_LEFT_POSITION_TOP = getScaleWidth(61);

const styles = StyleSheet.create({
  navBarSvgDecoration: {
    position: 'absolute',
  },
  resourceHeaderContainer: {
    position: 'relative',
  },
  svgShapeLeft: {
    left: 0,
    position: 'absolute',
    top: SVG_SHAPE_LEFT_POSITION_TOP,
  },
  svgShapeRight: {
    position: 'absolute',
    right: 0,
    top: SVG_SHAPE_RIGHT_POSITION_TOP,
  },
  thumbnailAndCardContainer: {
    marginTop: UI_SIZES.spacing.medium - UI_SIZES.elements.border.large * 2,
  },
});

export default styles;
