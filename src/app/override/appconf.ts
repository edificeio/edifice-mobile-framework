/**
 * Global runtime configuration override
 */

export default {
  matomo: {
    url: 'https://matomo.opendigitaleducation.com/matomo.php',
    siteId: 4, // MOBILE
  },
  webviewIdentifier: 'openent.CC3B2A9FC9C32565FF6237642B73E',

  platforms: [require('~/platforms/paris')['prod'], require('~/platforms/ent77')['prod']],
};
