/**
 * Theme declaration and overloading system.
 */

import deepmerge from "deepmerge";
import { ColorValue } from "react-native";

import customTheme from "../conf/CustomTheme";

export interface ITheme {
    color: {
        cardBackground: ColorValue,
        checkboxBorder: ColorValue,
        listItemBorder: ColorValue,
        pageBackground: ColorValue,
        shadowColor: ColorValue,
        primary: {
            regular: ColorValue,
            subleShadow: ColorValue,
            shadow: ColorValue,
            light: ColorValue
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
        cardBackground: '#fff',
        checkboxBorder: '#7a7a7a',
        listItemBorder: '#606060',
        pageBackground: '#f8f8fa',
        shadowColor: '#000000',
        primary: {
            regular: '#ff8000',
            subleShadow: 'magenta',
            shadow: 'magenta',
            light: 'magenta'
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
            light: '#f8f8fa'
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
