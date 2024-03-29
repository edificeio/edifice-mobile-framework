import TextSize from 'react-native-text-size';

import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

import { DefaultButton } from './component';
import { BUTTON_ICON_SIZE } from './styles';
import { DefaultButtonProps } from './types';

const getButtonWidth = async ({ text, icons, type }: { text: string; icons?: number; type: string }): Promise<number> => {
  const textMeasure = await TextSize.measure({
    fontFamily: TextFontStyle.Bold.fontFamily,
    fontSize: TextSizeStyle.Normal.fontSize,
    text,
  });
  if (textMeasure) {
    let btnWidth;
    // determine button width
    // + 10 bc textMeasure is not precise
    if (type !== 'primary' && type !== 'secondary') btnWidth = textMeasure.width + 10 + 2 * UI_SIZES.spacing.tiny;
    else btnWidth = textMeasure.width + 10 + 2 * UI_SIZES.spacing.small + 2 * UI_SIZES.elements.border.default;
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
