import TextSize from 'react-native-text-size';
import { BUTTON_ICON_SIZE, DefaultButton } from './component';
import { DefaultButtonProps } from './types';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

const getButtonWidth = async ({ text, icons, type }: { text: string; icons?: number; type: string }): Promise<number> => {
  const textMeasure = await TextSize.measure({
    fontFamily: TextFontStyle.Bold.fontFamily,
    fontSize: TextSizeStyle.Normal.fontSize,
    text,
  });
  if (textMeasure) {
    let btnWidth;
    // determine button width
    if (type !== 'primary' && type !== 'secondary') btnWidth = getScaleWidth(textMeasure.width) + 2 * UI_SIZES.spacing.tiny;
    else btnWidth = getScaleWidth(textMeasure.width) + 2 * UI_SIZES.spacing.small + 2 * UI_SIZES.elements.border.default;

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
