import { Temporal } from '@js-temporal/polyfill';

import { Storage } from '~/framework/util/storage';

/**
 * Key that earlier versions of the app wrote at the root of the storage (no namespace), for the date the privacy alert was shown.
 * It holds a JSON string: a date (`"2026-10-29"`), or, from the former carousel, an instant (`"2026-10-28T22:00:00.000Z"`).
 */
export const LEGACY_PRIVACY_ALERT_KEY = 'privacyAlert';

/**
 * Reads the date of the former key, which has two shapes (see `LEGACY_PRIVACY_ALERT_KEY`). Anything else gives `undefined`.
 * An instant is a day in the time zone of the device: it is the day the alert was shown.
 */
export const parseLegacyPrivacyAlertDate = (raw: string | undefined) => {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw);
    if (typeof value !== 'string') return undefined;
    try {
      return Temporal.PlainDate.from(value);
    } catch {
      return Temporal.Instant.from(value).toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDate();
    }
  } catch {
    return undefined;
  }
};

export const mediaStorage = Storage.device<{
  /** The day (`YYYY-MM-DD`, local) the privacy alert was last shown. */
  privacyAlertDate: string;
}>({
  migrations: [
    {
      id: 'privacy-alert-date',
      // The former key is left as it is: a version of the app that doesn't know the new one still reads it.
      run: storage => {
        const date = parseLegacyPrivacyAlertDate(Storage.global.getString(LEGACY_PRIVACY_ALERT_KEY));
        if (date && !storage.contains('privacyAlertDate')) storage.set('privacyAlertDate', date.toString());
      },
    },
  ],
  namespace: 'media',
});
