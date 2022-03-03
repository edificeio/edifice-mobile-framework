import { Dimensions } from 'react-native';
import { UI_SIZES } from '~/framework/components/constants';

const hires = UI_SIZES.screen.width > 340;

export const screenWidth = UI_SIZES.screen.width;

const imageWidth = Math.round(UI_SIZES.screen.width / 2);
const imageHeight = Math.round(UI_SIZES.screen.height / 2);

export const size = {
  large: {
    container: Math.round(imageWidth * 0.82),
    image: Math.round(imageWidth * 0.3),
    margin: Math.round(imageHeight * 0.26),
  },
  small: {
    container: Math.round(imageWidth * 0.4),
    image: hires ? Math.round(imageWidth * 0.3) : Math.round(imageWidth * 0.15),
    margin: hires ? Math.round(imageHeight * 0.1) : Math.round(imageHeight * 0.05),
  },
};
