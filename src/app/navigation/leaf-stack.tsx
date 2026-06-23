/**
 * Leaf Stack Navigation
 * Stack navigation that render header + screen inside.
 * Use this instead of `createNativeStackNavigator` for every stack that displays actual screen content.
 */

import React from 'react';

import { ParamListBase, StaticConfig } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigatorProps, NativeStackTypeBag } from '@react-navigation/native-stack';

import { NetworkMonitorBar } from '~/framework/util/monitoring/network';

import { BaseStackScreenLayout, defaultScreenOptions } from './layout';

export function createLeafStackNavigator<
  const ParamList extends ParamListBase,
  const NavigatorID extends string | undefined = string | undefined,
  const TypeBag extends NativeStackTypeBag<ParamList, NavigatorID> = NativeStackTypeBag<ParamList, NavigatorID>,
  const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Parameters<typeof createNativeStackNavigator<ParamList, NavigatorID, TypeBag, Config>>[0]) {
  const NativeStack = createNativeStackNavigator<ParamList, NavigatorID, TypeBag, Config>(config);

  return {
    ...NativeStack,
    Navigator: function LeafStackNavigator(props: React.ComponentProps<typeof NativeStack.Navigator>) {
      // Note: I cannot destructure directly in function parameters because of some Typescript bad handling.
      const { screenLayout: ScreenLayout = LeafStackScreenLayout, screenOptions: _screenOptions } = props as Pick<
        NativeStackNavigatorProps,
        'screenLayout' | 'screenOptions'
      >;
      const screenOptions: NonNullable<typeof _screenOptions> = React.useCallback(
        p => {
          const ret = leafStackScreenOptions(p as Parameters<Extract<NativeStackNavigatorProps['screenOptions'], Function>>[0]);
          const givenOptions = typeof _screenOptions === 'function' ? _screenOptions(p) : _screenOptions;
          if (givenOptions) Object.assign(ret, givenOptions);
          return ret;
        },
        [_screenOptions],
      );
      return <NativeStack.Navigator {...props} screenOptions={screenOptions} screenLayout={ScreenLayout} />;
    },
  };
}

export const leafStackScreenOptions = (props: Parameters<Extract<NativeStackNavigatorProps['screenOptions'], Function>>[0]) =>
  ({
    ...defaultScreenOptions(props),
    headerBackButtonDisplayMode: 'minimal',
    headerShown: true,
    headerTintColor: props.theme.colors.text,
    headerTitleAlign: 'center',
    statusBarStyle: 'light',
  }) satisfies NativeStackNavigatorProps['screenOptions'];

export function LeafStackScreenLayout({ ...props }: Parameters<NonNullable<NativeStackNavigatorProps['screenLayout']>>[0]) {
  return (
    <>
      <NetworkMonitorBar />
      <BaseStackScreenLayout {...props} />
    </>
  );
}
