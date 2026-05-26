import { Platform } from 'react-native';

import { HeaderBackButton, HeaderButton, HeaderTitle } from '@react-navigation/elements';
import {
  NativeStackHeaderItemCustom,
  NativeStackHeaderItemProps,
  NativeStackNavigatorProps,
  NativeStackOptionsArgs,
} from '@react-navigation/native-stack';
import { StackPresentationTypes } from 'react-native-screens';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName, SvgProps } from '~/framework/components/picture';

import { AllModulesNavigationParams } from './types';

export type ScreenOptions<T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams> = (
  props: NativeStackOptionsArgs<AllModulesNavigationParams, T>,
) => Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;

const defaultNavBarOptions = <T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams>(
  { navigation }: NativeStackOptionsArgs<AllModulesNavigationParams, T>,
  icon: SvgIconName,
  title?: string,
): ReturnType<Extract<NativeStackNavigatorProps['screenOptions'], Function>> => ({
  headerLeft:
    Platform.OS === 'android'
      ? ({ canGoBack, tintColor }) =>
          canGoBack ? (
            <>
              <HeaderBackButton
                backImage={({ tintColor: fill }) => (
                  <Svg name={icon} fill={fill} width={UI_SIZES.elements.navbarIconSize} height={UI_SIZES.elements.navbarIconSize} />
                )}
                tintColor={tintColor}
                onPress={navigation.goBack}
                displayMode="minimal"
                testID="header-back"
              />
            </>
          ) : (
            <></>
          )
      : undefined,
  headerTitle: title
    ? titleProps => (
        <HeaderTitle {...titleProps} testID="header-title">
          {title}
        </HeaderTitle>
      )
    : undefined,
  unstable_headerLeftItems:
    Platform.OS === 'ios'
      ? ({ canGoBack, tintColor }) =>
          canGoBack
            ? [
                {
                  element: (
                    <HeaderBackButton
                      backImage={({ tintColor: fill }) => (
                        <Svg
                          name={icon}
                          fill={fill}
                          width={UI_SIZES.elements.navbarIconSize}
                          height={UI_SIZES.elements.navbarIconSize}
                        />
                      )}
                      tintColor={tintColor}
                      onPress={navigation.goBack}
                      displayMode="minimal"
                      testID="header-back"
                    />
                  ),
                  type: 'custom',
                },
              ]
            : []
      : undefined,
});

/**
 * Use this function to declare your screen options.
 *
 * Examples:
 * ```typescript
 * // Provides type hints and autocompletion
 * screenOptions(() => ({ title: I18n.get('screen-title') }));
 *
 * // Give the screen name to have options props automatically typed !
 * screenOptions<'module/screen'>(({route}) => ({ title: route.params.name }));
 * ```
 * @param options
 * @returns
 */
export function screenOptions<T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams>(
  _options: ScreenOptions<T>,
) {
  return (props: NativeStackOptionsArgs<AllModulesNavigationParams, T>) => {
    const { title, ...options } = _options(props);
    return {
      ...defaultNavBarOptions(props, 'ui-rafterLeft', title),
      ...options,
    } as Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;
  };
}

/**
 * Use this function to declare your screen options.
 *
 * Examples:
 * ```typescript
 * // Provides type hints and autocompletion
 * screenOptions(() => ({ title: I18n.get('screen-title') }));
 *
 * // Give the screen name to have options props automatically typed !
 * screenOptions<'module/screen'>(({route}) => ({ title: route.params.name }));
 * ```
 * @param options
 * @returns
 */
export function modalScreenOptions<T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams>(
  presentation: Extract<
    StackPresentationTypes,
    'modal' | 'transparentModal' | 'containedModal' | 'containedTransparentModal' | 'fullScreenModal' | 'formSheet' | 'pageSheet'
  >,
  _options: ScreenOptions<T>,
) {
  return (props: NativeStackOptionsArgs<AllModulesNavigationParams, T>) => {
    const { title, ...options } = _options(props);
    return {
      presentation,
      tabBarVisible: false,
      ...defaultNavBarOptions(props, 'ui-close', title),
      ...options,
    } as Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;
  };
}

/**
 * Generates an action button with custom svg icon
 */
export function headerAction(
  {
    disabled,
    icon,
    onPress,
    testID,
  }: {
    icon: SvgProps['name'];
    disabled?: boolean;
    onPress?: () => void;
    testID: string;
  },
  { tintColor }: NativeStackHeaderItemProps,
): NativeStackHeaderItemCustom {
  return {
    element: (
      <HeaderButton onPress={onPress} testID={testID} disabled={disabled}>
        <Svg name={icon} fill={tintColor} width={UI_SIZES.elements.navbarIconSize} height={UI_SIZES.elements.navbarIconSize} />
      </HeaderButton>
    ),
    type: 'custom',
  };
}
