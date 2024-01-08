/**
 * Global runtime configuration override
 */

export default {
  matomo: {
    url: 'https://matomo.opendigitaleducation.com/matomo.php',
    siteId: 3, // MOBILE DEV
  },
  webviewIdentifier: 'dev.CC3B2A9FC9C32565FF6237642B73E',

  platforms: [
    // Recettes
    require('~/platforms/recette'),
    require('~/platforms/recette-leo'),
    require('~/platforms/recette-ent77'),
    require('~/platforms/recette-paris'),

    // Formation
    require('~/platforms/formation')['formation-one'],
    require('~/platforms/formation')['formation-neo'],

    // Preprod
    require('~/platforms/saas')['preprod-one'],
    require('~/platforms/saas')['preprod-neo'],

    // Prod
    require('~/platforms/saas')['prod-one'],
    require('~/platforms/saas')['prod-neo'],

    // Divers
    require('~/platforms/localhost'),
  ],
};
