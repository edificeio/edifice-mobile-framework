/**
 * Theme declaration and overloading system.
 */
import deepmerge from 'deepmerge';
import { ColorValue } from 'react-native';

import customTheme from '~/app/override/theme';

export interface ITheme {
  color: {
    notificationBadge: ColorValue;
    listItemBorder: ColorValue;
    inputBorder: ColorValue;
    shadowColor: ColorValue;
    background: {
      card: ColorValue;
      page: ColorValue;
    };
    primary: {
      regular: ColorValue;
      subtleShadow: ColorValue;
      shadow: ColorValue;
      light: ColorValue;
      extraLight: ColorValue;
    };
    secondary: {
      regular: ColorValue;
      subtleShadow: ColorValue;
      shadow: ColorValue;
      light: ColorValue;
      extraLight: ColorValue;
    };
    neutral: {
      regular: ColorValue;
      subtleShadow: ColorValue;
      shadow: ColorValue;
      light: ColorValue;
      extraLight: ColorValue;
    };
    text: {
      regular: ColorValue;
      heavy: ColorValue;
      light: ColorValue;
      inverse: ColorValue;
    };
    info: ColorValue;
    success: ColorValue;
    failure: ColorValue;
    warning: ColorValue;
  };
  flashMessages: {
    'grey-dark': ColorValue;
    red: ColorValue;
    orange: ColorValue;
    green: ColorValue;
    blue: ColorValue;
  };
  greyPalette: {
    black: ColorValue;
    graphite: ColorValue;
    stone: ColorValue;
    grey: ColorValue;
    cloudy: ColorValue;
    pearl: ColorValue;
    fog: ColorValue;
    white: ColorValue;
  };
  homeworkDays: {
    monday: ColorValue;
    tuesday: ColorValue;
    wednesday: ColorValue;
    thursday: ColorValue;
    friday: ColorValue;
    saturday: ColorValue;
  };
  palePalette: {
    secondary: ColorValue;
    purple: ColorValue;
    red: ColorValue;
    turquoise: ColorValue;
    green: ColorValue;
    yellow: ColorValue;
    orange: ColorValue;
  };
  schoolbook: {
    categories: {
      canteen: ColorValue;
      event: ColorValue;
      'last-minute': ColorValue;
      leisure: ColorValue;
      outing: ColorValue;
      various: ColorValue;
    };
  };
  themeOpenEnt: {
    cyan: ColorValue;
    green: ColorValue;
    yellow: ColorValue;
    red: ColorValue;
    pink: ColorValue;
    purple: ColorValue;
    indigo: ColorValue;
  };
}

// Magenta color indicated non-defined values

export const defaultTheme: ITheme = {
  color: {
    notificationBadge: '#ff3a55',
    listItemBorder: '#dddddd',
    inputBorder: '#dddddd',
    shadowColor: '#000000',
    background: {
      card: '#fff',
      page: '#f8f8fa',
    },
    primary: {
      regular: '#ff8000',
      subtleShadow: 'magenta',
      shadow: 'magenta',
      light: 'magenta',
      extraLight: 'magenta',
    },
    secondary: {
      regular: '#2a9cc8',
      subtleShadow: '#0088b6',
      shadow: 'magenta',
      light: '#d7eaf4',
      extraLight: '#eef3f8',
    },
    neutral: {
      regular: '#868ca0',
      subtleShadow: 'magenta',
      shadow: 'magenta',
      light: '#f8f8fa',
      extraLight: '#f8f8fa',
    },
    text: {
      regular: '#414355',
      heavy: '#1f2029',
      light: '#858Fa9',
      inverse: '#ffffff',
    },
    info: '#4bafd5',
    success: '#7dbf85',
    failure: '#e13a3a',
    warning: '#f59700',
  },
  flashMessages: {
    'grey-dark': '#5b6472',
    red: '#c74848',
    orange: '#ff9057',
    green: '#3cb371',
    blue: '#2a9cc8',
  },
  greyPalette: {
    black: '#4a4a4a',
    graphite: '#7a7a7a',
    stone: '#a9a9a9',
    grey: '#c7c7c7',
    cloudy: '#e4e4e4',
    pearl: '#f2f2f2',
    fog: '#fafafa',
    white: '#ffffff',
  },
  homeworkDays: {
    monday: '#6fbe2e',
    tuesday: '#a348c0',
    wednesday: '#46afe6',
    thursday: '#ff3a55',
    friday: '#ff8d2e',
    saturday: '#eac403',
  },
  palePalette: {
    secondary: '#e4f4ff',
    purple: '#faebff',
    red: '#ffe8ea',
    turquoise: '#e4f4ff',
    green: '#e7f6e0',
    yellow: '#e7f6e0',
    orange: '#ffefe3',
  },
  schoolbook: {
    categories: {
      canteen: '#2a9cc8',
      event: '#763294',
      'last-minute': '#e13a3a',
      leisure: '#ecbe30',
      outing: '#46bfaf',
      various: '#1a22a2',
    },
  },
  themeOpenEnt: {
    cyan: '#4bafd5',
    green: '#46bfaf',
    yellow: '#ecbe30',
    red: '#e13a3a',
    pink: '#b930a2',
    purple: '#763294',
    indigo: '#1a22a2',
  },
};

export default deepmerge(defaultTheme, customTheme); // Theme is purely static, compute this once.
