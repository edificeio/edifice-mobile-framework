import type { ParamListBase, RouteProp, StaticParamList } from '@react-navigation/native';
import type {
  createNativeStackNavigator,
  createNativeStackScreen,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import type { AllModulesNavigationParams } from '~/app/module';

import type { useRootStackNavigation } from './root-stack';
import type { createTabStackNavigation } from './tab-stack';
import type { useTabNavigation } from './tabs';

/**
 * Type of the root navigator, built from all modules screens and modals.
 * It's the same as the one created in `useModulesNavigation` but it must be known statically for the global navigation types.
 */
type RootStackType = ReturnType<typeof createNativeStackNavigator<AllModulesNavigationParams>>;

declare module '@react-navigation/native' {
  interface RootNavigator extends RootStackType {}
}

/**
 * Component rendered by a screen (or a modal).
 * A static screen only declares the `route` prop (see `StaticScreenProps`): navigation is done through hooks (`useNavigation`).
 * Screens that need the `navigation` prop (dynamic navigation) are rejected on purpose.
 * Name and params are `any` here as they are inferred from the component props at each screen.
 */
export type ScreenComponent = React.ComponentType<{
  route: Omit<RouteProp<ParamListBase>, 'name' | 'params'> & { name: any; params: any };
}>;

export type ScreenConfig<Component extends ScreenComponent> = Parameters<typeof createNativeStackScreen<Component>>[0];
/**
 * What a screen tells the telemetry about itself (read by the module that declares it, never given to the navigator).
 */
export type ScreenTelemetryConfig = {
  /**
   * The screen only hosts another navigation container (an independent one): the screens inside it are tracked by their own
   * container, which also tracks this route, first. So the navigation of the app must not track it.
   */
  delegatesTelemetry?: boolean;
};

export type ScreenOptionsProps = Parameters<Extract<ScreenConfig<ScreenComponent>['options'], Function>>[0];

type TabStackParamList = StaticParamList<ReturnType<typeof createTabStackNavigation>>;
export type StackNavigation = NativeStackNavigationProp<TabStackParamList, keyof TabStackParamList>;

type RootStackParamList = StaticParamList<ReturnType<typeof useRootStackNavigation>>;
export type RootNavigation = NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;

type TabsParamList = StaticParamList<ReturnType<typeof useTabNavigation>>;
export type TabNavigation = NativeStackNavigationProp<TabsParamList, keyof TabsParamList>;

/**
 * Key that carries the type of what a screen gives back to `navigateAsync` (see `ScreenPromiseParams`).
 * Type only: no value has this key at runtime, so it is never exported.
 */
declare const screenPromiseBrand: unique symbol;

type ScreenPromiseKeys<Result> = {
  [screenPromiseBrand]?: Result;
  /** Set by `navigateAsync`: the promise that `useScreenPromise` settles. */
  screenPromiseId?: string;
};

/**
 * Params of a screen (a modal or not) that gives back a result to the screen that opened it with `navigation.navigateAsync`.
 * Declared in the props of the screen: `StaticScreenProps<ScreenPromiseParams<{ source: FileSource }, LocalFile[]>>`.
 * A screen without params is declared with `ScreenPromiseParams<undefined, Result>`.
 */
export type ScreenPromiseParams<Params extends object | undefined, Result> =
  | ([NonNullable<Params>] extends [never] ? ScreenPromiseKeys<Result> : NonNullable<Params> & ScreenPromiseKeys<Result>)
  | Extract<Params, undefined>;

/**
 * Whether params are built with `ScreenPromiseParams`.
 * Params that are only `undefined` are ruled out first: their object part is `never`, and `keyof never` holds every key, the brand too.
 */
type HasScreenPromise<Params> = [NonNullable<Params>] extends [never]
  ? false
  : typeof screenPromiseBrand extends keyof NonNullable<Params>
    ? true
    : false;

/** Result declared by params built with `ScreenPromiseParams` (`never` for other params). */
export type ScreenPromiseResult<Params> =
  HasScreenPromise<Params> extends true
    ? Required<NonNullable<Params>> extends { [screenPromiseBrand]: infer Result }
      ? Result
      : never
    : never;

/** Screens and modals that give back a result: the ones `navigateAsync` can open. */
export type ScreenPromiseName = {
  [Name in keyof AllModulesNavigationParams]: HasScreenPromise<AllModulesNavigationParams[Name]> extends true ? Name : never;
}[keyof AllModulesNavigationParams];
