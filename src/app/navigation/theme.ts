import { DefaultTheme, Theme } from '@react-navigation/native';
import deepmerge from 'deepmerge';

import theme from '~/app/theme';
import { TextFontStyle } from '~/framework/components/text';
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
    bold: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
    heavy: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
    medium: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
    regular: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
  },
});

export default navigationLightTheme;
