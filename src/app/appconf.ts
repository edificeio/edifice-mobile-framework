import appConfOverride from '~/app/override/appconf';

const emptyAppConf = {
  matomo: undefined,
  platforms: [],
  webviewIdentifier: undefined,
};

export default {
  ...emptyAppConf,
  ...appConfOverride,
};
