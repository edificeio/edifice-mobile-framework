import { TrackEventOfModuleArgs, trackingActionAddSuffix } from '.';
import { Error } from '../error';
import { IAnyModuleConfig } from '../moduleTool';
import { TryActionOptions } from '../redux/actions';

export const TRACK_ERROR = Symbol('TRACK_ERROR');
export const TRACK_DEFAULT = Symbol('TRACK_DEFAULT');
export const TRACK_NAME = Symbol('TRACK_NAME');
export const TRACK_ERROR_CODE = Symbol('TRACK_ERROR_CODE');

export type TrackValuesDeclSuccess = [string?, number?];
export type TrackValuesDeclError = [number?];
export type TrackValuesDeclErrorOverride = [string, string?, number?];

export interface TrackValuesMap {
  [TRACK_NAME]: string;
  [TRACK_ERROR]?: TrackValuesDeclError | ((e: Error | undefined) => TrackValuesDeclErrorOverride | undefined);
  [TRACK_DEFAULT]?: TrackValuesDeclSuccess;
  [key: string]: TrackValuesDeclSuccess;
}

export const makeTrackOption =
  <Args extends any[], ReturnType>(
    mConf: Pick<IAnyModuleConfig, 'trackingName'>,
    trackValues: TrackValuesMap | ((returnedValue: Awaited<ReturnType> | Error, ...args: Args) => TrackValuesMap),
  ): TryActionOptions<Args, ReturnType>['track'] =>
  (returnedValue: Awaited<ReturnType> | Error, ...args: Args) => {
    const values = typeof trackValues === 'function' ? trackValues(returnedValue, ...args) : trackValues;
    const {
      [TRACK_NAME]: name,
      [TRACK_DEFAULT]: def = [] as TrackValuesDeclSuccess,
      [TRACK_ERROR]: err = [def[1]] as TrackValuesDeclError,
      ...customValues
    } = values;
    if (returnedValue instanceof global.Error) {
      if (typeof err === 'function') {
        const realErr = err(returnedValue);
        if (!realErr) return [mConf, trackingActionAddSuffix(name, false), Error.getDeepErrorType(returnedValue)?.toString()];
        return [
          mConf,
          trackingActionAddSuffix(name, realErr[0]),
          realErr[1] ?? Error.getDeepErrorType(returnedValue)?.toString(),
          realErr[2],
        ];
      } else {
        return [mConf, trackingActionAddSuffix(name, false), Error.getDeepErrorType(returnedValue)?.toString(), err[0]];
      }
    } else {
      for (const [k, v] of Object.entries(customValues)) {
        if (k === returnedValue) {
          return [mConf, trackingActionAddSuffix(name, true), v[0], v[1]];
        }
      }
      return [mConf, trackingActionAddSuffix(name, true), def[0], def[1]];
    }
  };

export const trackScenario = <Scenarios>(name: keyof Scenarios, customs?: Omit<TrackValuesMap, typeof TRACK_NAME>) =>
  ({
    [TRACK_NAME]: name,
    ...customs,
  }) as TrackValuesMap;

export const trackScenarios = <Scenarios>(items: { [name in keyof Scenarios]: Omit<TrackValuesMap, typeof TRACK_NAME> }) =>
  Object.fromEntries(
    (Object.entries(items) as [keyof Scenarios, Omit<TrackValuesMap, typeof TRACK_NAME>][]).map(([k, v]) => [
      k,
      trackScenario<Scenarios>(k, v),
    ]),
  ) as {
    [name in keyof typeof items]: ReturnType<typeof trackScenario>;
  };

type Category = string;
type Action = string;
type ActionSuffix = string;
type Name = string;
type ErrorName = typeof TRACK_ERROR_CODE | Name;
type Value = number;

export type TrackingEventDefaultSuccessValues = [Category, Action, Name?, Value?];
export type TrackingEventCustomSuccessValues = [Category, [Action, ActionSuffix], Name?, Value?];
export type TrackingScenarioSuccess<Args extends any[], ReturnType> =
  | TrackingEventDefaultSuccessValues
  | TrackingEventCustomSuccessValues
  | ((
      returnedValue: Awaited<ReturnType> | Error,
      ...args: Args
    ) => TrackingEventDefaultSuccessValues | TrackingEventCustomSuccessValues | undefined);

export type TrackingEventDefaultErrorValue = [Category, Action, ErrorName?, Value?];
export type TrackingEventCustomErrorValue = [Category, [Action, ActionSuffix], ErrorName?, Value?];
export type TrackingScenarioError<Args extends any[]> =
  | TrackingEventDefaultErrorValue
  | TrackingEventCustomErrorValue
  | ((returnedValue: Error, ...args: Args) => TrackingEventDefaultErrorValue | TrackingEventCustomErrorValue | undefined);

export type TrackingScenario<Args extends any[], ReturnType> = {
  [TRACK_ERROR]?: TrackingScenarioError<Args>;
  [TRACK_DEFAULT]: TrackingScenarioSuccess<Args, ReturnType>;
  [key: string]: TrackingScenarioSuccess<Args, ReturnType>;
};

const createTrackOption =
  <Args extends any[], ReturnType>(scenario: TrackingScenario<Args, ReturnType>) =>
  (returnedValue: Awaited<ReturnType> | Error, ...args: Args) => {
    if (returnedValue instanceof global.Error) {
      const errorScenario = scenario[TRACK_ERROR] ?? scenario[TRACK_DEFAULT];
      let errorScenarioValues = typeof errorScenario === 'function' ? errorScenario(returnedValue, ...args) : errorScenario;
      if (errorScenarioValues === undefined)
        errorScenarioValues =
          typeof scenario[TRACK_DEFAULT] === 'function' ? scenario[TRACK_DEFAULT](returnedValue, ...args) : scenario[TRACK_DEFAULT];
      return (
        errorScenarioValues &&
        ([
          { trackingName: errorScenarioValues[0] },
          Array.isArray(errorScenarioValues[1])
            ? trackingActionAddSuffix(errorScenarioValues[1][0], errorScenarioValues[1][1])
            : trackingActionAddSuffix(errorScenarioValues[1], false),
          errorScenarioValues[2] === undefined || errorScenarioValues[2] === TRACK_ERROR_CODE
            ? Error.getDeepErrorType(returnedValue)?.toString()
            : errorScenarioValues[2],
          errorScenarioValues[3],
        ] as TrackEventOfModuleArgs)
      );
    } else {
      const successScenario =
        (typeof returnedValue === 'string' ? scenario[returnedValue] : scenario[TRACK_DEFAULT]) ?? scenario[TRACK_DEFAULT];
      const successScenarioValues =
        typeof successScenario === 'function' ? successScenario(returnedValue, ...args) : successScenario;
      return (
        successScenarioValues &&
        ([
          { trackingName: successScenarioValues[0] },
          Array.isArray(successScenarioValues[1])
            ? trackingActionAddSuffix(successScenarioValues[1][0], successScenarioValues[1][1])
            : trackingActionAddSuffix(successScenarioValues[1], true),
          successScenarioValues[2],
          successScenarioValues[3],
        ] as TrackEventOfModuleArgs)
      );
    }
  };

/**
 * New API to define tracking data events usable with tryAction/handleAction.
 */
export const createTrackEvents = <Names extends string>(scenarios: Record<Names, TrackingScenario<any[], any>>) => {
  const ret = {};
  for (const scenario in scenarios) {
    ret[scenario as string] = createTrackOption(scenarios[scenario]);
  }
  return ret as Record<Names, ReturnType<typeof createTrackOption>>;
};
