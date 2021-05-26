/**
 * Theme declaration and overloading system.
 */

import deepmerge from "deepmerge";
import { ColorValue } from "react-native";

import customTheme from "../../conf/CustomTheme";

export interface ITheme {
    color: {
        listItemBorder: ColorValue,
        inputBorder: ColorValue,
        shadowColor: ColorValue,
        background: {
            card: ColorValue,
            page: ColorValue
        },
        primary: {
            regular: ColorValue,
            subleShadow: ColorValue,
            shadow: ColorValue,
            light: ColorValue
            extraLight: ColorValue
        },
        secondary: {
            regular: ColorValue,
            subtleShadow: ColorValue,
            shadow: ColorValue,
            light: ColorValue,
            extraLight: ColorValue
        },
        tertiary : {
            regular: ColorValue,
            subtleShadow: ColorValue,
            shadow: ColorValue,
            light: ColorValue
            extraLight: ColorValue
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
        listItemBorder: '#606060',
        inputBorder: '#dddddd',
        shadowColor: '#000000',
        background: {
            card: '#fff',
            page: '#f8f8fa'
        },
        primary: {
            regular: '#ff8000',
            subleShadow: 'magenta',
            shadow: 'magenta',
            light: 'magenta',
            extraLight: '#magenta'
        },
        secondary: {
            regular: '#2a9cc8',
            subtleShadow: '#0088b6',
            shadow: 'magenta',
            light: '#d7eaf4',
            extraLight: '#eef3f8'
        },
        tertiary : {
            regular: '#868ca0',
            subtleShadow: 'magenta',
            shadow: 'magenta',
            light: '#f8f8fa',
            extraLight: '#magenta'
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
