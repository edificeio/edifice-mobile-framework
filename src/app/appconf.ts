import appConfOverride from '~/app/override/appconf';

const emptyAppConf = {
  matomo: undefined,
  webviewIdentifier: undefined,
  platforms: [],
};

export default {
  ...emptyAppConf,
  ...appConfOverride,
};
