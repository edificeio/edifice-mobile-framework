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
