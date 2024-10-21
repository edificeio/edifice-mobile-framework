/**
 * Theme declaration and overloading system.
 */
import { ColorValue } from 'react-native';

import deepmerge from 'deepmerge';

import customTheme from '~/app/override/theme';

//  8888888          888                      .d888
//    888            888                     d88P"
//    888            888                     888
//    888   88888b.  888888  .d88b.  888d888 888888  8888b.   .d8888b  .d88b.
//    888   888 "88b 888    d8P  Y8b 888P"   888        "88b d88P"    d8P  Y8b
//    888   888  888 888    88888888 888     888    .d888888 888      88888888
//    888   888  888 Y88b.  Y8b.     888     888    888  888 Y88b.    Y8b.
//  8888888 888  888  "Y888  "Y8888  888     888    "Y888888  "Y8888P  "Y8888

export interface IShades {
  evil: ColorValue;
  dark: ColorValue;
  regular: ColorValue;
  light: ColorValue;
  pale: ColorValue;
}

export interface ITheme {
  // Color palette used globally
  palette: {
    primary: IShades;
    secondary: IShades;
    complementary: {
      red: IShades;
      orange: IShades;
      yellow: IShades;
      green: IShades;
      blue: IShades;
      indigo: IShades;
      purple: IShades;
      pink: IShades;
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
    text: {
      regular: ColorValue;
      light: ColorValue;
      inverse: ColorValue;
    };
  };
  // Semantic usage of the color palette
  color: {
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

type ThemeInitializer = Pick<ITheme, 'palette' | 'legacy'> & {
  init(): ITheme;
};

export const defaultTheme: ThemeInitializer = {
  //  888     888
  //  888     888
  //  888     888
  //  888     888 .d8888b   8888b.   .d88b.   .d88b.  .d8888b
  //  888     888 88K          "88b d88P"88b d8P  Y8b 88K
  //  888     888 "Y8888b. .d888888 888  888 88888888 "Y8888b.
  //  Y88b. .d88P      X88 888  888 Y88b 888 Y8b.          X88
  //   "Y88888P"   88888P' "Y888888  "Y88888  "Y8888   88888P'
  //                                     888
  //                                Y8b d88P
  //                                 "Y88P"
  init() {
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
      notificationBadge: this.palette.complementary.red.regular,
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

  //  888     888          888
  //  888     888          888
  //  888     888          888
  //  Y88b   d88P  8888b.  888 888  888  .d88b.  .d8888b
  //   Y88b d88P      "88b 888 888  888 d8P  Y8b 88K
  //    Y88o88P   .d888888 888 888  888 88888888 "Y8888b.
  //     Y888P    888  888 888 Y88b 888 Y8b.          X88
  //      Y8P     "Y888888 888  "Y88888  "Y8888   88888P'
  // Magenta color indicated non-defined values
  palette: {
    complementary: {
      blue: {
        dark: '#1B84AC',
        evil: 'magenta',
        light: '#AADAED',
        pale: '#E4F4FF',
        regular: '#2A9CC8',
      },
      green: {
        dark: '#33A797',
        evil: 'magenta',
        light: '#A2E0D8',
        pale: '#E7F5F4',
        regular: '#46BFAF',
      },
      indigo: {
        dark: '#121982',
        evil: 'magenta',
        light: '#9297E5',
        pale: '#DDE8FD',
        regular: '#1A22A2',
      },
      orange: {
        dark: '#F17A17',
        evil: 'magenta',
        light: '#FFC696',
        pale: '#FFEFE3',
        regular: '#FF8D2E',
      },
      pink: {
        dark: '#9C2288',
        evil: 'magenta',
        light: '#E39CD7',
        pale: '#FFE5FB',
        regular: '#B930A2',
      },
      purple: {
        dark: '#5D1D79',
        evil: 'magenta',
        light: '#B68ACA',
        pale: '#F4EAF9',
        regular: '#763294',
      },
      red: {
        evil: 'magenta',
        dark: '#C82222',
        regular: '#E13A3A',
        light: '#F48A8A',
        pale: '#FFD9D9',
      },
      yellow: {
        dark: '#DAA910',
        evil: 'magenta',
        light: '#F6DE94',
        regular: '#ECBE30',
        pale: '#FFF4D1',
      },
    },
    flashMessages: {
      'grey-dark': '#5b6472',
      'blue': '#2a9cc8',
      'orange': '#ff9057',
      'green': '#3cb371',
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
      evil: 'magenta',
      light: '#AADAED',
      pale: '#E4F4FF',
      regular: '#2A9CC8',
    },
    secondary: {
      dark: '#F17A17',
      evil: 'magenta',
      light: '#FFC696',
      pale: '#FFEFE3',
      regular: '#FF8D2E',
    },
    status: {
      failure: { dark: '#D12A2A', evil: 'magenta', light: '#F3A6A6', pale: '#FFE9E9', regular: '#e13a3a' },
      info: { dark: '#3499BF', evil: 'magenta', light: '#ACD6E6', pale: '#D7E8EE', regular: '#4bafd5' },
      success: { dark: '#70A977', evil: 'magenta', light: '#BBE1BF', pale: '#DAF1DD', regular: '#7dbf85' },
      warning: { dark: '#E58D00', evil: 'magenta', light: '#F2C987', pale: '#FDECD2', regular: '#f59700' },
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

const { init, ...customThemeRest } = customTheme as Partial<ThemeInitializer>;
const totalTheme: ITheme = {
  ...defaultTheme,
  palette: deepmerge(defaultTheme.palette, customThemeRest.palette || {}),
}.init();

if (init) init.call(totalTheme);

export default totalTheme;
