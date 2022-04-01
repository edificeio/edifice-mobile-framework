import { DEPRECATED_getCurrentPlatform } from "~/framework/util/_legacy_appConf";


export const loginRouteNames = {
  default: 'LoginHome',
  wayf: 'LoginWAYF',
};

export const getLoginRouteName = () => {
  return DEPRECATED_getCurrentPlatform()?.wayf ? loginRouteNames.wayf : loginRouteNames.default;
};
