import { buildAppLookupMap, buildNotifTypeLookupMap } from '~/framework/modules/myapps/reducer';
import type { AppsInfoAggregated } from '~/framework/modules/myapps/types';
import type { IEntcoreNotificationType } from '~/framework/modules/timeline/reducer/notif-definitions/notif-types';

// Keeps the result of the last call, and computes again only when the data given changes.
const cacheLastResult = <Input, Output>(compute: (input: Input) => Output) => {
  let last: { input: Input; output: Output } | undefined;

  return (input: Input) => {
    if (!last || last.input !== input) last = { input, output: compute(input) };
    return last.output;
  };
};

/**
 * Tables to read an app from a name, and a notification type from its type and event type.
 *
 * Building them walks every module of the app, so it happens once for all their readers, and again
 * only when the data behind them changes;
 * that is, when the session loads it.
 */
export const getAppLookupMap = cacheLastResult((apps: Record<string, AppsInfoAggregated>) => buildAppLookupMap(apps));

export const getNotifTypeLookupMap = cacheLastResult((types: IEntcoreNotificationType[]) => buildNotifTypeLookupMap(types));
