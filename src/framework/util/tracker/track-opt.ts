import { trackingActionAddSuffix } from '.';
import { Error } from '../error';
import { IAnyModuleConfig } from '../moduleTool';
import { TryActionOptions } from '../redux/actions';

export const TRACK_ERROR = Symbol('TRACK_ERROR');
export const TRACK_DEFAULT = Symbol('TRACK_DEFAULT');
export const TRACK_NAME = Symbol('TRACK_NAME');

export type TrackValuesDeclSuccess = [string?, number?];
export type TrackValuesDeclError = [number?];

export interface TrackValuesMap {
  [TRACK_NAME]: string;
  [TRACK_ERROR]?: TrackValuesDeclError;
  [TRACK_DEFAULT]?: TrackValuesDeclSuccess;
  [key: string]: TrackValuesDeclSuccess;
}

export const makeTrackOption =
  <Args extends any[], ReturnType>(
    mConf: IAnyModuleConfig,
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
      return [mConf, trackingActionAddSuffix(name, false), Error.getDeepErrorType(returnedValue)?.toString(), err[0]];
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
