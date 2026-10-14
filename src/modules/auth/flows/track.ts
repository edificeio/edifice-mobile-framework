import { Trackers, type TrackEventOfModuleArgs } from '~/framework/util/tracker';

type TrackOption<T> = (returnedValue: T | Error) => TrackEventOfModuleArgs | undefined;

/**
 * Runs the function and sends the tracking event of the matching scenario (success or failure) with the result.
 * Errors are thrown back.
 */
export const withTracking = async <T>(trackOption: TrackOption<T>, fn: () => Promise<T>) => {
  try {
    const result = await fn();
    const event = trackOption(result);
    if (event) Trackers.trackEventOfModule(...event);
    return result;
  } catch (e) {
    const event = trackOption(e as Error);
    if (event) Trackers.trackEventOfModule(...event);
    throw e;
  }
};
