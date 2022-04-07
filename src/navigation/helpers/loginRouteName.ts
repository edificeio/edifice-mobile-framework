import I18n from "i18n-js";
import { NavigationActions, NavigationNavigateAction } from "react-navigation";
import appConf from "~/framework/util/appConf";
import { DEPRECATED_getCurrentPlatform } from "~/framework/util/_legacy_appConf";


export const loginRouteNames = {
  default: 'LoginHome',
  wayf: 'LoginWAYF',
};

export const getLoginRouteName = () => {
  return DEPRECATED_getCurrentPlatform()?.wayf ? loginRouteNames.wayf : loginRouteNames.default;
};

export const getLoginStackToDisplay = (selectedPlatform: string | null, forceOnboarding: boolean = false) => {
  const ret = [] as NavigationNavigateAction[];
  const onboardingTexts = I18n.t('user.onboardingScreen.onboarding');
  const hasOnboardingTexts = onboardingTexts && onboardingTexts.length;
  const hasMultiplePlatforms = appConf.platforms.length > 1;
  if (hasOnboardingTexts) ret.push(NavigationActions.navigate({ routeName: 'Onboarding' }));
  if (hasMultiplePlatforms && (selectedPlatform || !ret.length))
    ret.push(NavigationActions.navigate({ routeName: 'PlatformSelect' }));
  if (!forceOnboarding && (selectedPlatform || !ret.length)) {
    ret.push(NavigationActions.navigate({ routeName: getLoginRouteName() }));
  }
  return ret;
};