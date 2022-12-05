import TextSize from 'react-native-text-size';

import { TextFontStyle, TextSizeStyle } from '~/framework/components//text';
import { UI_SIZES } from '~/framework/components/constants';

import { ActionButton, pictureSize } from './component';
import { ActionButtonProps } from './types';

const getActionButtonWidth = async ({
  text,
  iconName,
  emoji,
  url,
}: {
  text: string;
  iconName?: string;
  emoji?: string;
  url?: string;
}): Promise<number> => {
  const textMeasure = await TextSize.measure({
    fontFamily: TextFontStyle.Bold.fontFamily,
    fontSize: TextSizeStyle.Normal.fontSize,
    text,
  });
  if (textMeasure) {
    // determine button width
    // add +1 because measure text returns floating value
    const btnWidth = textMeasure.width + 1 + 2 * UI_SIZES.spacing.medium + 2 * UI_SIZES.elements.actionButtonBorder + 10;
    if (url || iconName)
      return new Promise(resolve => {
        resolve(btnWidth + pictureSize + UI_SIZES.spacing.minor);
      });
    if (emoji) {
      const emojiMeasure = await TextSize.measure({
        fontFamily: TextFontStyle.Bold.fontFamily,
        fontSize: TextSizeStyle.Normal.fontSize,
        text: ` ${emoji}`,
      });
      if (emojiMeasure)
        return new Promise(resolve => {
          resolve(btnWidth + emojiMeasure.width);
        });
    }
    return new Promise(resolve => {
      resolve(btnWidth);
    });
  }
  return new Promise(resolve => {
    resolve(0);
  });
};

export { ActionButton, ActionButtonProps, getActionButtonWidth };
