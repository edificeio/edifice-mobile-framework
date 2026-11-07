/**
 * Helpers of « Mes applis » that are not rules of the apps.
 */

/** Lower case, without accents. */
export const normalizeString = (str: string): string =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** `camelCase` and spaces to `kebab-case`, in lower case and without accents nor other characters. */
export const toKebabCase = (str: string): string =>
  normalizeString(str.replace(/([a-z0-9])([A-Z])/g, '$1-$2'))
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

/** `testID` of the card of an app (E2E tests). */
export const getAppTestID = (app: { name: string }): string => `myapps-${toKebabCase(app.name)}`;
