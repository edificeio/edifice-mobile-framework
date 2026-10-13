/**
 * Hooks to read what is known of a platform, in memory (not persisted). Public: other modules import them from here
 * (`~/modules/auth/hooks/use-platform-data`). They return `undefined` while the data is not loaded; to have the auth context or the
 * legal urls loaded when they are missing, use `usePlatformAuthContext` / `usePlatformAuthLegalUrls` of `./use-platform-config`.
 */
export { usePlatformContext } from '~/modules/auth/store/platform-context';
export { usePlatformLegalUrls } from '~/modules/auth/store/platform-legal-urls';
