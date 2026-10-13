import { DefaultTheme, Theme } from '@react-navigation/native';
import deepmerge from 'deepmerge';

import { TextFontStyle } from '~/framework/components/text';
import { DeepPartial } from '~/util/types';

import theme from '../theme';

export const navigationLightTheme: Theme = deepmerge<Theme, DeepPartial<Theme>>(DefaultTheme, {
  colors: {
    /** Screen background */
    background: theme.ui.background.card?.toString(),

    /** Tab Bar border (for non-native tab bar) */
    border: theme.palette.grey.cloudy?.toString(),

    /** Header background */
    card: theme.palette.primary.regular?.toString(),

    /** Notification badge on non-native tab bar */
    notification: theme.palette.primary.regular?.toString(),

    /** Tint color for title, buttons (except liquid glass), and active tab icon & text */
    primary: theme.ui.text.inverse?.toString(),

    /** Tint color inactive tab icon & text */
    text: theme.ui.text.inverse?.toString(),
  },
  dark: false,
  fonts: {
    bold: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
    heavy: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
    medium: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
    regular: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
  },
});
