import { BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigatorProps } from '@react-navigation/native-stack';

/**
 * All screens have these options
 */
const commonScreenOptions: NativeStackNavigatorProps['screenOptions'] & BottomTabNavigatorProps['screenOptions'] = {};

/**
 * All stack navigator have these options
 */
const commonStackOptions: NativeStackNavigatorProps['screenOptions'] = {
  ...commonScreenOptions,
};

/**
 * Every stack screen that **hides** navBar have these options
 */
export const hiddenStackScreenOptions: NativeStackNavigatorProps['screenOptions'] = {
  headerShown: false,
};

/**
 * Every stack screen that **shows** navBar have these options
 */
export const visibleStackScreenOptions: NativeStackNavigatorProps['screenOptions'] = {
  headerBackButtonDisplayMode: 'minimal',
  headerTitleAlign: 'center',
};

/**
 * Only the root stack navigator have these options
 */
export const rootStackOptions: NativeStackNavigatorProps['screenOptions'] = {
  ...commonStackOptions,
};

/**
 * The modals group & the tabStack group must have the same options
 */
export const tabStackOptions: NativeStackNavigatorProps['screenOptions'] = {
  ...commonStackOptions,
  ...visibleStackScreenOptions,
};

export const tabsOptions: BottomTabNavigatorProps['screenOptions'] = {
  ...commonScreenOptions,
  freezeOnBlur: true,
  headerShown: false,
  lazy: true,
  popToTopOnBlur: true,
};
