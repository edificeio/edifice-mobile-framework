/**
 * Theme declaration and overloading system.
 */
import { ColorValue } from 'react-native';

import deepmerge from 'deepmerge';
import RNRestart from 'react-native-restart';

import themeOverrides from '~/app/override/theme';
import type { SvgProps } from '~/framework/components/picture';
import { MediaType } from '~/framework/modules/media';
import { preferences as userPreferences } from '~/framework/modules/user/storage';
import type { ImageProps } from '~/framework/util/media-deprecated';
import { Storage } from '~/framework/util/storage';
import { DeepPartial, ValueOf } from '~/utils/types';

//  8888888          888                      .d888
//    888            888                     d88P"
//    888            888                     888
//    888   88888b.  888888  .d88b.  888d888 888888  8888b.   .d8888b  .d88b.
//    888   888 "88b 888    d8P  Y8b 888P"   888        "88b d88P"    d8P  Y8b
//    888   888  888 888    88888888 888     888    .d888888 888      88888888
//    888   888  888 Y88b.  Y8b.     888     888    888  888 Y88b.    Y8b.
//  8888888 888  888  "Y888  "Y8888  888     888    "Y888888  "Y8888P  "Y8888

export interface IShades {
  dark: ColorValue;
  regular: ColorValue;
  light: ColorValue;
  pale: ColorValue;
}

export type IntentIcon =
  | ({ type: 'Svg' } & Pick<SvgProps, 'name'>)
  | ({ type: 'Image' } & Pick<ImageProps, 'source' | 'src' | 'srcSet'>)
  | { type: 'Text'; text: string };

export interface EntAppTheme {
  accentColors: IShades;
  icon: IntentIcon;
}

export const THEME_LEVEL = {
  FIRST_DEGREE: '1D',
  SECOND_DEGREE: '2D',
} as const;

export type ThemeLevel = ValueOf<typeof THEME_LEVEL>;

export interface ITheme {
  // Theme identity, declared by the override
  level: ThemeLevel;
  displayName: string;
  // Color palette used globally
  palette: {
    primary: IShades;
    secondary: IShades;
    complementary: {
      'red': IShades;
      'orange': IShades;
      'yellow': IShades;
      'green': IShades;
      'blue': IShades;
      'indigo': IShades;
      'purple': IShades;
      'pink': IShades;
      'nabook-color': Pick<IShades, 'regular'>;
    };
    grey: {
      darkness: ColorValue;
      black: ColorValue;
      graphite: ColorValue;
      stone: ColorValue;
      grey: ColorValue;
      cloudy: ColorValue;
      pearl: ColorValue;
      fog: ColorValue;
      white: ColorValue;
    };
    status: {
      info: IShades;
      success: IShades;
      failure: IShades;
      warning: IShades;
    };
    flashMessages: {
      'grey-dark': ColorValue;
      'red': ColorValue;
      'orange': ColorValue;
      'green': ColorValue;
      'blue': ColorValue;
    };
  };
  // UI usage of the color palette
  ui: {
    notificationBadge: ColorValue;
    shadowColor: ColorValue;
    shadowColorTransparent: ColorValue;
    background: {
      card: ColorValue;
      empty: ColorValue;
      page: ColorValue;
    };
    border: {
      listItem: ColorValue;
      input: ColorValue;
    };
    navigation: {
      // will be SvgIconName when design provide svgs
      line?: ColorValue[];
      navBar: {
        tint: ColorValue;
        background: ColorValue;
      };
      tabBar: {
        tintFocus: ColorValue;
        tintBlur: ColorValue;
        background: ColorValue;
        highlight?: ColorValue;
      };
    };
    text: {
      regular: ColorValue;
      light: ColorValue;
      inverse: ColorValue;
    };
    overlay: {
      medium: ColorValue;
      light: ColorValue;
      bar: ColorValue;
    };
  };
  // Semantic usage of the color palette
  color: {
    mails: {
      unread: ColorValue;
      selected: ColorValue;
    };
    homework: {
      days: {
        monday: { accent: ColorValue; light: ColorValue; background: ColorValue };
        tuesday: { accent: ColorValue; light: ColorValue; background: ColorValue };
        wednesday: { accent: ColorValue; light: ColorValue; background: ColorValue };
        thursday: { accent: ColorValue; light: ColorValue; background: ColorValue };
        friday: { accent: ColorValue; light: ColorValue; background: ColorValue };
        saturday: { accent: ColorValue; light: ColorValue; background: ColorValue };
      };
    };
    schoolbook: {
      acknowledge: ColorValue;
      acknowledged: ColorValue;
      categories: {
        'canteen': ColorValue;
        'event': ColorValue;
        'last-minute': ColorValue;
        'leisure': ColorValue;
        'outing': ColorValue;
        'various': ColorValue;
      };
    };
    profileTypes: {
      Student: ColorValue;
      Relative: ColorValue;
      Personnel: ColorValue;
      Teacher: ColorValue;
      Guest: ColorValue;
    };
  };
  media: { [key in MediaType | 'default']: IntentIcon };
  // Legacy values
  legacy: {
    neutral: {
      regular: ColorValue;
      subtleShadow: ColorValue;
      shadow: ColorValue;
      light: ColorValue;
      subtleLight: ColorValue;
      extraLight: ColorValue;
    };
  };
}

type ThemeInitializer = Omit<ITheme, 'ui' | 'color' | 'media'> & {
  init(): ITheme;
};

export const defaultTheme: ThemeInitializer = {
  displayName: 'user-theme-displayname-2d',
  init() {
    (this as Partial<ITheme>).media = {
      attachment: { name: 'ui-attachment', type: 'Svg' },
      audio: { name: 'ui-audio', type: 'Svg' },
      default: { name: 'ui-attachment', type: 'Svg' },
      embedded: { name: 'ui-external-link', type: 'Svg' },
      image: { name: 'ui-image', type: 'Svg' },
      link: { name: 'ui-external-link', type: 'Svg' },
      office: { name: 'ui-text-page', type: 'Svg' },
      resource: { name: 'ui-external-link', type: 'Svg' },
      video: { name: 'ui-recordVideo', type: 'Svg' },
    };
    (this as Partial<ITheme>).ui = {
      background: {
        card: this.palette.grey.white,
        empty: this.palette.grey.fog,
        page: this.palette.grey.fog,
      },
      border: {
        input: this.palette.grey.cloudy,
        listItem: this.palette.grey.cloudy,
      },
      navigation: {
        navBar: {
          background: this.palette.primary.regular,
          tint: this.palette.grey.white,
        },
        tabBar: {
          background: this.palette.grey.white,
          tintBlur: this.palette.grey.graphite,
          tintFocus: this.palette.primary.regular,
        },
      },
      notificationBadge: this.palette.complementary.red.regular,
      overlay: {
        bar: '#ffffffaf',
        light: '#0000008c',
        medium: '#000000af',
      },
      shadowColor: '#000',
      shadowColorTransparent: '#000000af',
      text: {
        inverse: this.palette.grey.white,
        light: this.palette.grey.graphite,
        regular: this.palette.grey.black,
      },
    };

    (this as Partial<ITheme>).color = {
      homework: {
        days: {
          friday: {
            accent: this.palette.complementary.orange.regular,
            background: this.palette.complementary.orange.pale,
            light: this.palette.complementary.orange.light,
          },
          monday: {
            accent: this.palette.complementary.green.regular,
            background: this.palette.complementary.green.pale,
            light: this.palette.complementary.green.light,
          },
          saturday: {
            accent: this.palette.complementary.yellow.regular,
            background: this.palette.complementary.yellow.pale,
            light: this.palette.complementary.yellow.light,
          },
          thursday: {
            accent: this.palette.complementary.red.regular,
            background: this.palette.complementary.red.pale,
            light: this.palette.complementary.red.light,
          },
          tuesday: {
            accent: this.palette.complementary.purple.regular,
            background: this.palette.complementary.purple.pale,
            light: this.palette.complementary.purple.light,
          },
          wednesday: {
            accent: this.palette.complementary.blue.regular,
            background: this.palette.complementary.blue.pale,
            light: this.palette.complementary.blue.light,
          },
        },
      },
      mails: {
        selected: this.palette.primary.pale,
        unread: this.palette.secondary.pale,
      },
      profileTypes: {
        Guest: this.palette.complementary.pink.regular,
        Personnel: this.palette.complementary.purple.regular,
        Relative: this.palette.complementary.blue.regular,
        Student: this.palette.complementary.orange.regular,
        Teacher: this.palette.complementary.green.regular,
      },
      schoolbook: {
        acknowledge: this.palette.status.warning.regular,
        acknowledged: this.palette.status.success.regular,
        categories: {
          'canteen': this.palette.complementary.blue.regular,
          'event': this.palette.complementary.purple.regular,
          'last-minute': this.palette.complementary.red.regular,
          'leisure': this.palette.complementary.yellow.regular,
          'outing': this.palette.complementary.green.regular,
          'various': this.palette.complementary.indigo.regular,
        },
      },
    };

    return this as unknown as ITheme;
  },

  legacy: {
    neutral: {
      extraLight: '#f8f8fa',
      light: '#f8f8fa',
      regular: '#868ca0',
      shadow: '#1f2029',
      subtleLight: '#858Fa9',
      subtleShadow: '#414355',
    },
  },

  level: THEME_LEVEL.SECOND_DEGREE,

  palette: {
    complementary: {
      'blue': {
        dark: '#1B84AC',
        light: '#AADAED',
        pale: '#E4F4FF',
        regular: '#2A9CC8',
      },
      'green': {
        dark: '#33A797',
        light: '#A2E0D8',
        pale: '#E7F5F4',
        regular: '#46BFAF',
      },
      'indigo': {
        dark: '#121982',
        light: '#9297E5',
        pale: '#DDE8FD',
        regular: '#1A22A2',
      },
      'nabook-color': {
        regular: '#120d37',
      },
      'orange': {
        dark: '#F17A17',
        light: '#FFC696',
        pale: '#FFEFE3',
        regular: '#FF8D2E',
      },
      'pink': {
        dark: '#9C2288',
        light: '#E39CD7',
        pale: '#FFE5FB',
        regular: '#B930A2',
      },
      'purple': {
        dark: '#5D1D79',
        light: '#B68ACA',
        pale: '#F4EAF9',
        regular: '#763294',
      },
      'red': {
        dark: '#C82222',
        light: '#F48A8A',
        pale: '#FFD9D9',
        regular: '#E13A3A',
      },
      'yellow': {
        dark: '#DAA910',
        light: '#F6DE94',
        pale: '#FFF4D1',
        regular: '#ECBE30',
      },
    },
    flashMessages: {
      'blue': '#2a9cc8',
      'green': '#3cb371',
      'grey-dark': '#5b6472',
      'orange': '#ff9057',
      'red': '#c74848',
    },
    grey: {
      black: '#4a4a4a',
      cloudy: '#e4e4e4',
      darkness: '#000000',
      fog: '#fafafa',
      graphite: '#909090',
      grey: '#C7C7C7',
      pearl: '#f2f2f2',
      stone: '#B0B0B0',
      white: '#ffffff',
    },
    primary: {
      dark: '#1B84AC',
      light: '#AADAED',
      pale: '#E4F4FF',
      regular: '#2A9CC8',
    },
    secondary: {
      dark: '#F17A17',
      light: '#FFC696',
      pale: '#FFEFE3',
      regular: '#FF8D2E',
    },
    status: {
      failure: { dark: '#D12A2A', light: '#F3A6A6', pale: '#FFE9E9', regular: '#e13a3a' },
      info: { dark: '#3499BF', light: '#ACD6E6', pale: '#D7E8EE', regular: '#4bafd5' },
      success: { dark: '#70A977', light: '#BBE1BF', pale: '#DAF1DD', regular: '#7dbf85' },
      warning: { dark: '#E58D00', light: '#F2C987', pale: '#FDECD2', regular: '#f59700' },
    },
  },
};

//   .d88888b.                                    d8b      888                888                        d8b
//  d88P" "Y88b                                   Y8P      888                888                        Y8P
//  888     888                                            888                888
//  888     888 888  888  .d88b.  888d888 888d888 888  .d88888  .d88b.        888       .d88b.   .d88b.  888  .d8888b
//  888     888 888  888 d8P  Y8b 888P"   888P"   888 d88" 888 d8P  Y8b       888      d88""88b d88P"88b 888 d88P"
//  888     888 Y88  88P 88888888 888     888     888 888  888 88888888       888      888  888 888  888 888 888
//  Y88b. .d88P  Y8bd8P  Y8b.     888     888     888 Y88b 888 Y8b.           888      Y88..88P Y88b 888 888 Y88b.
//   "Y88888P"    Y88P    "Y8888  888     888     888  "Y88888  "Y8888        88888888  "Y88P"   "Y88888 888  "Y8888P
//                                                                                                   888
//                                                                                              Y8b d88P
//                                                                                               "Y88P"

// Compute once (Singleton)

type CustomThemeOverride = DeepPartial<Pick<ITheme, 'color' | 'palette' | 'ui' | 'legacy'>> & Pick<ITheme, 'displayName' | 'level'>;
type AllThemesOverrides = { themes?: CustomThemeOverride[] };

// themes come from the build-time override.
// an override declaring none gets a single
// theme built from defaultTheme.
type AllThemes = ITheme[];
const themeList = (themeOverrides as AllThemesOverrides).themes ?? [];
export const themes: AllThemes = themeList.length
  ? themeList.map(override =>
      deepmerge<ITheme, CustomThemeOverride>(
        deepmerge<ThemeInitializer, CustomThemeOverride>(defaultTheme, override).init(),
        override,
      ),
    )
  : [deepmerge<ThemeInitializer, object>(defaultTheme, {}).init()];

const THEME_STORAGE_KEY = 'theme';

const isValidThemeIndex = (index?: number): index is number => index !== undefined && index >= 0 && index < themes.length;

function readInitialThemeIndex(): number {
  try {
    const stored = Storage.global.getNumber(THEME_STORAGE_KEY);
    if (isValidThemeIndex(stored)) return stored;
  } catch {
    //fall back to the default theme
  }
  return 0;
}

/**
 * All these values are constqnts because theme is changed by restarting the app after set new theme index in MMKV.
 */
const currentIndex = readInitialThemeIndex();
const currentTheme = themes[currentIndex];

export const getThemes = (): { displayName: string; level: ThemeLevel }[] =>
  themes.map(t => ({ displayName: t.displayName, level: t.level }));

export function setTheme(index: number): void {
  if (!isValidThemeIndex(index) || index === currentIndex) return;
  try {
    Storage.global.set(THEME_STORAGE_KEY, index);
    userPreferences.set(THEME_STORAGE_KEY, index);
    RNRestart.restart();
  } catch {
    // ToDo : what here ?
  }
}

export function setThemeAfterLogin() {
  setTheme(userPreferences.getNumber(THEME_STORAGE_KEY) ?? 0);
}

export default currentTheme;
