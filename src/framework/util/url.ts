/**
 * Get url domain
 * @param url: url to parse
 * @param subdomain: include subdomain if any or not
 */
export const getDomain = (url: string, subdomain: boolean = false) => {
  let domain = url.replace(/(https?:\/\/)?(www.)?/i, '');
  if (!subdomain) {
    const components = domain.split('.');
    domain = components.slice(components.length - 2).join('.');
  }
  return removeTrailingSlash(domain);
};

/**
 * Return a string that have no more accents.
 * @param url
 */
export const removeTrailingSlash = (str: string) => (str.endsWith('/') ? str.slice(0, -1) : str);
