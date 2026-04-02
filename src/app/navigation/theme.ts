import { DefaultTheme, Theme } from '@react-navigation/native';
import deepmerge from 'deepmerge';

import theme from '~/app/theme';
import { HeadingFontStyle } from '~/framework/components/text';
import { DeepPartial } from '~/utils/types';

export const navigationLightTheme: Theme = deepmerge<Theme, DeepPartial<Theme>>(DefaultTheme, {
  colors: {
    background: theme.ui.background.card.toString(),
    border: theme.palette.grey.cloudy.toString(),
    card: theme.palette.primary.regular.toString(),
    notification: theme.palette.primary.regular.toString(),
    primary: theme.palette.primary.regular.toString(),
    text: theme.ui.text.inverse.toString(),
  },
  dark: false,
  fonts: {
    bold: { fontFamily: HeadingFontStyle.Bold.fontFamily },
    heavy: { fontFamily: HeadingFontStyle.Bold.fontFamily },
    medium: { fontFamily: HeadingFontStyle.Bold.fontFamily },
    regular: { fontFamily: HeadingFontStyle.Bold.fontFamily },
  },
});

export default navigationLightTheme;
