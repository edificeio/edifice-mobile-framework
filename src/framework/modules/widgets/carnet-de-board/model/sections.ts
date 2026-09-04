import type { ColorValue } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth } from '~/framework/components/constants';
import type { SvgIconName } from '~/framework/components/picture';

import { CarnetDeBordSection } from './carnet-de-bord';

export const SECTION_ICON_SIZE = getScaleWidth(36);
export const SECTION_ICON_INNER_SIZE = getScaleWidth(20);

export interface CarnetDeBordSectionColors {
  background: ColorValue;
  borders: ColorValue;
  icon: ColorValue;
}

export interface CarnetDeBordSectionStyle {
  colors: CarnetDeBordSectionColors;
  icon: SvgIconName;
}

export const SECTION_STYLE: Record<CarnetDeBordSection, CarnetDeBordSectionStyle> = {
  [CarnetDeBordSection.CAHIER_DE_TEXTES]: {
    colors: {
      background: theme.palette.complementary.green.pale,
      borders: theme.palette.complementary.green.light,
      icon: theme.palette.complementary.green.dark,
    },
    icon: 'diary-outline',
  },
  [CarnetDeBordSection.NOTES]: {
    colors: {
      background: theme.palette.complementary.blue.pale,
      borders: theme.palette.complementary.blue.light,
      icon: theme.palette.complementary.blue.dark,
    },
    icon: 'ui-notes',
  },
  [CarnetDeBordSection.COMPETENCES]: {
    colors: {
      background: theme.palette.complementary.purple.pale,
      borders: theme.palette.complementary.purple.light,
      icon: theme.palette.complementary.purple.dark,
    },
    icon: 'ui-teacher',
  },
  [CarnetDeBordSection.VIE_SCOLAIRE]: {
    colors: {
      background: theme.palette.complementary.orange.pale,
      borders: theme.palette.complementary.orange.light,
      icon: theme.palette.complementary.orange.dark,
    },
    icon: 'ui-clock-alert',
  },
};
