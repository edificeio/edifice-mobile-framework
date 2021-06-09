/**
 * Theme declaration and overloading system.
 */

import deepmerge from "deepmerge";
import { ColorValue } from "react-native";

import customTheme from "../conf/CustomTheme";

export interface ITheme {
    color: {
        pageBackground: ColorValue,
        cardBackground: ColorValue,
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
            light: ColorValue
        }
        success: ColorValue,
        failure: ColorValue,
        warning: ColorValue
    }
}

// Magenta color indicated non-defined values

export const defaultTheme: ITheme = {
    color: {
        pageBackground: 'rgb(248,248,250)',
        cardBackground: '#fff',
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
            light: '#858Fa9'
        },
        success: '#19ca72',
        failure: '#e04b35',
        warning: '#ffb000'
    }
}

export default deepmerge(defaultTheme, customTheme); // Theme is purely static, compute this once.
