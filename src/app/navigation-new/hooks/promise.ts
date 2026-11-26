/**
 * Screens opened as a promise (modals or not): `navigateAsync` (added to `useNavigation`, see `navigation.ts`) on the side of the screen
 * that opens the other one, `useScreenPromise` on the side of the opened screen.
 */
import React from 'react';

import { useNavigation as useReactNavigation } from '@react-navigation/native';

import type { AllModulesNavigationParams } from '~/app/module';

import type { ScreenPromiseName, ScreenPromiseResult } from '../types';

/** Params given to `navigateAsync`: the ones of the screen, without the id of the promise, which it sets itself. */
type NavigateAsyncParams<Name extends ScreenPromiseName> =
  Omit<NonNullable<AllModulesNavigationParams[Name]>, 'screenPromiseId'> | Extract<AllModulesNavigationParams[Name], undefined>;

/**
 * Opens a screen like `navigate` does, and gives a promise of what the screen gives back (see `useScreenPromise`).
 * The promise settles when the screen is unmounted: with what the screen resolved, or `undefined` when the user left it.
 */
export type NavigateAsync = <Name extends ScreenPromiseName>(
  ...args: undefined extends AllModulesNavigationParams[Name]
    ? [name: Name, params?: NavigateAsyncParams<Name>]
    : [name: Name, params: NavigateAsyncParams<Name>]
) => Promise<ScreenPromiseResult<AllModulesNavigationParams[Name]> | undefined>;

type PromiseOutcome = { status: 'resolved'; value: unknown } | { status: 'rejected'; error: unknown };

/**
 * Promises given by `navigateAsync` that are not settled yet, by id.
 * The id goes through the params of the screen, but not the functions of the promise: params must stay serializable.
 * `outcome` is what the screen resolved or rejected with: the promise is settled when the screen unmounts.
 */
const pendingPromises = new Map<
  string,
  { resolve: (value: unknown) => void; reject: (error: unknown) => void; outcome?: PromiseOutcome }
>();
let lastPromiseId = 0;

/**
 * Builds the `navigateAsync` of a navigation: it opens a screen that gives back a result, and returns a promise of that result.
 * @param navigation any navigation object of react-navigation.
 */
export const createNavigateAsync =
  (navigation: unknown): NavigateAsync =>
  (name, params?) =>
    new Promise((resolve, reject) => {
      const id = String(++lastPromiseId);
      pendingPromises.set(id, { reject, resolve: resolve as (value: unknown) => void });
      // The action goes up to the navigator that has the route (the root stack for a modal), even from a navigation typed on a nested
      // navigator that does not know it. Hence the navigation typed by its `navigate` only.
      (navigation as { navigate: (routeName: string, routeParams: object) => void }).navigate(name, {
        ...params,
        screenPromiseId: id,
      });
    });

/**
 * Gives a screen opened with `navigateAsync` (a modal or not) the means to settle its promise. Both leave the screen (`goBack`): the
 * promise is settled when the screen unmounts, with the last outcome given, or with `undefined` if there is none (left by the user, or
 * removed by the navigation). A screen of a tab stays mounted while the user is on another tab: its promise waits until then.
 * Opened by a plain `navigate`, the screen has no promise: both only leave it.
 * ```ts
 * function ImportScreen({ route }: StaticScreenProps<ScreenPromiseParams<{ source: FileSource }, LocalFile[]>>) {
 *   const { reject, resolve } = useScreenPromise(route);
 * ```
 */
export const useScreenPromise = <Params>(route: { params: Params }) => {
  const navigation = useReactNavigation();
  const id = (route.params as { screenPromiseId?: string } | undefined)?.screenPromiseId;

  // Settles on unmount, and when the id changes: the screen was opened again while shown, its params were replaced.
  // Fast Refresh runs the cleanup too: a screen edited in dev while it is shown settles its promise early.
  React.useEffect(() => {
    if (id === undefined) return;
    return () => {
      const pending = pendingPromises.get(id);
      if (!pending) return;
      pendingPromises.delete(id);
      if (pending.outcome?.status === 'rejected') pending.reject(pending.outcome.error);
      else pending.resolve(pending.outcome?.value);
    };
  }, [id]);

  const settle = React.useCallback(
    (outcome: PromiseOutcome) => {
      const pending = id === undefined ? undefined : pendingPromises.get(id);
      if (pending) pending.outcome = outcome;
      navigation.goBack();
    },
    [id, navigation],
  );

  const resolve = React.useCallback((value: ScreenPromiseResult<Params>) => settle({ status: 'resolved', value }), [settle]);
  const reject = React.useCallback((error: unknown) => settle({ error, status: 'rejected' }), [settle]);

  return { reject, resolve };
};
