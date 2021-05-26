/**
 * Theme declaration and overloading system.
 */

import deepmerge from "deepmerge";
import { ColorSchemeName, ColorValue } from "react-native";

import customTheme from "../conf/CustomTheme";

export interface ITheme {
    color: {
        pageBackground: ColorValue,
        cardBackground: ColorValue,
        checkboxBorder: ColorValue,
        listItemBorder: ColorValue,
        primary: {
            regular: ColorValue,
            subleShadow: ColorValue,
            shadow: ColorValue,
            light: ColorValue
        },
        secondary: {
            regular: ColorValue,
            subleShadow: ColorValue,
            shadow: ColorValue,
            light: ColorValue
        },
        text: {
            regular: ColorValue,
            heavy: ColorValue,
            light: ColorValue,
            inverse: ColorValue
        }
        success: ColorValue,
        failure: ColorValue,
        warning: ColorValue
    },
    themeOpenEnt: {
        cyan: ColorValue,
        green: ColorValue,
        yellow: ColorValue,
        red: ColorValue,
        pink: ColorValue,
        purple: ColorValue,
        indigo: ColorValue,
    }
}

// Magenta color indicated non-defined values

export const defaultTheme: ITheme = {
    color: {
        pageBackground: 'rgb(248,248,250)',
        cardBackground: '#fff',
        checkboxBorder: '#7a7a7a',
        listItemBorder: '#606060',
        primary: {
            regular: '#ff8000',
            subleShadow: 'magenta',
            shadow: 'magenta',
            light: 'magenta'
        },
        secondary: {
            regular: '#2a9cc8',
            subleShadow: '#0088b6',
            shadow: 'magenta',
            light: 'magenta'
        },
        text: {
            regular: '#414355',
            heavy: '#1f2029',
            light: '#858Fa9',
            inverse: '#ffffff'
        },
        success: '#19ca72',
        failure: '#e04b35',
        warning: '#ffb000'
    },
    themeOpenEnt: {
        cyan: '#4bafd5',
        green: '#46bfaf',
        yellow: '#ecbe30',
        red: '#e13a3a',
        pink: '#b930a2',
        purple: '#763294',
        indigo: '#1a22a2'
    }
}

export default deepmerge(defaultTheme, customTheme); // Theme is purely static, compute this once.
