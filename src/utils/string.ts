import unorm from "unorm";

/**
 * Return a string that have no more accents.
 * @param str
 */
// from https://stackoverflow.com/a/37511463/6111343 but using unorm package instead of String.normalize (not available on Android Release mode)
export const removeAccents = (str: string) => {
  const combiningChars = /[\u0300-\u036F]/g;
  return unorm.nfd(str).replace(combiningChars, "");
};

/**
 * Returns a converted string from camelCase (or UppercasedCamelCase) to snake_case.
 * @param camelCase
 */
export function toSnakeCase(camelCase: string) {
  const upperChars = camelCase.match(/([A-Z])/g);
  if (!upperChars) {
    return camelCase;
  }

  let str = camelCase;
  for (let i = 0, n = upperChars.length; i < n; i++) {
    str = str.replace(new RegExp(upperChars[i]), "_" + upperChars[i].toLowerCase());
  }

  if (str.slice(0, 1) === "_") {
    str = str.slice(1);
  }

  return str;
}
