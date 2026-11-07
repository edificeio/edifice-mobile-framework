/**
 * Onboarding of « Mes applis »: shown automatically once per session, until the user goes through its current version.
 */

/** Version of the onboarding: change it to show a new onboarding to everyone. */
export const ONBOARDING_VERSION = 'v1';

/** The user went through the current onboarding (`seenVersion`: the last version they went through). */
export const isOnboardingSeen = (seenVersion: string | undefined, version = ONBOARDING_VERSION): boolean => seenVersion === version;

export const shouldShowOnboarding = (
  seenVersion: string | undefined,
  shownThisSession: boolean,
  version = ONBOARDING_VERSION,
): boolean => !shownThisSession && !isOnboardingSeen(seenVersion, version);
