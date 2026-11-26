/**
 * Navigation hooks of the app: the ones of react-navigation, with `navigateAsync` added to `useNavigation`.
 * Import them from `~/app/navigation-new` rather than from `@react-navigation/native`.
 */
import React from 'react';

import { type GenericNavigation, useNavigation as useReactNavigation } from '@react-navigation/native';

import { createNavigateAsync, type NavigateAsync } from './promise';

export { useFocusEffect, useIsFocused, useScrollToTop } from '@react-navigation/native';

/**
 * Same as `useNavigation` of react-navigation (same typing), with `navigateAsync` added: it opens a screen (a modal or not) that gives
 * back a result, and returns a promise of that result. See `ScreenPromiseParams` and `useScreenPromise` (`promise.ts`) for the side of
 * the opened screen.
 * ```ts
 * const navigation = useNavigation();
 * const files = await navigation.navigateAsync('media/import', { source: 'camera' });
 * ```
 */
export const useNavigation = <T = GenericNavigation<ReactNavigation.RootParamList>>() => {
  const navigation = useReactNavigation<T>();
  return React.useMemo(
    // Inherits from the navigation of react-navigation instead of copying it: its methods stay the ones of react-navigation.
    () =>
      Object.assign(Object.create(navigation as object), { navigateAsync: createNavigateAsync(navigation) }) as T & {
        navigateAsync: NavigateAsync;
      },
    [navigation],
  );
};
