import { HeaderBackButton } from '@react-navigation/elements';
import { NativeStackNavigatorProps, NativeStackOptionsArgs } from '@react-navigation/native-stack';
import { StackPresentationTypes } from 'react-native-screens';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';

import { AllModulesNavigationParams } from './types';
import { I18n } from '../i18n';

export type ScreenOptions<T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams> = (
  props: NativeStackOptionsArgs<AllModulesNavigationParams, T>,
) => Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;

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
  options: ScreenOptions<T>,
) {
  const regularOptions: NativeStackNavigatorProps['screenOptions'] = ({ navigation }) => ({
    unstable_headerLeftItems: ({ canGoBack, tintColor }) =>
      canGoBack
        ? [
            {
              element: (
                <HeaderBackButton
                  backImage={({ tintColor: fill }) => (
                    <Svg
                      name="ui-rafterLeft"
                      fill={fill}
                      width={UI_SIZES.elements.navbarIconSize}
                      height={UI_SIZES.elements.navbarIconSize}
                    />
                  )}
                  tintColor={tintColor}
                  onPress={navigation.goBack}
                />
              ),
              type: 'custom',
            },
          ]
        : [],
  });
  return ((props: NativeStackOptionsArgs<AllModulesNavigationParams, T>) => ({
    ...regularOptions(props),
    ...options(props),
  })) as Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;
  // return options as Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;
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
  options: ScreenOptions<T>,
) {
  const modalOptions: NativeStackNavigatorProps['screenOptions'] = ({ navigation }) => ({
    presentation,
    unstable_headerLeftItems: ({ tintColor }) => [
      {
        element: (
          <HeaderBackButton
            backImage={({ tintColor: fill }) => (
              <Svg name="ui-close" fill={fill} width={UI_SIZES.elements.navbarIconSize} height={UI_SIZES.elements.navbarIconSize} />
            )}
            tintColor={tintColor}
            onPress={navigation.goBack}
          />
        ),
        type: 'custom',
      },
    ],
  });

  return ((props: NativeStackOptionsArgs<AllModulesNavigationParams, T>) => ({
    ...modalOptions(props),
    ...options(props),
  })) as Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;
}
