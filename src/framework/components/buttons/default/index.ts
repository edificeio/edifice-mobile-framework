import { Platform } from 'react-native';

import TextSize from 'react-native-text-size';

import { DefaultButton } from './component';
import { BUTTON_ICON_SIZE } from './styles';
import { DefaultButtonProps } from './types';

import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

const getButtonWidth = async ({
  bold,
  icons,
  text,
  type,
}: {
  text: string;
  icons?: number;
  type: string;
  bold?: boolean;
}): Promise<number> => {
  const textMeasure = await TextSize.measure({
    fontFamily: TextFontStyle.Bold.fontFamily,
    fontSize: TextSizeStyle.Normal.fontSize,
    fontWeight: bold ? 'bold' : 'normal',
    text,
  });
  // +10 for android bc bold text is not measured correctly
  const width = Platform.OS === 'android' ? Math.ceil(textMeasure.width) + 10 : Math.ceil(textMeasure.width);
  if (textMeasure) {
    let btnWidth;
    // determine button width
    if (type !== 'primary' && type !== 'secondary') btnWidth = width + 2 * UI_SIZES.spacing.tiny;
    else btnWidth = width + 2 * UI_SIZES.spacing.small + 2 * UI_SIZES.elements.border.default;
    if (icons)
      return new Promise(resolve => {
        resolve(btnWidth + (BUTTON_ICON_SIZE + UI_SIZES.spacing.minor) * icons);
      });
    return new Promise(resolve => {
      resolve(btnWidth);
    });
  }
  return new Promise(resolve => {
    resolve(0);
  });
};

export { DefaultButton, getButtonWidth };
export type { DefaultButtonProps };
export default DefaultButton;
