import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';
import { IAppBadgeInfo } from '~/framework/util/moduleTool';

export const buildAppBadgesIndex = (appsInfo: AppsInfoAggregated[]): Record<string, IAppBadgeInfo> => {
  const badgesCollection: Record<string, IAppBadgeInfo> = {};

  appsInfo.forEach(app => {
    const key = app.displayName.toUpperCase();
    const appColor = app.color;
    const themeMainColor = theme.palette.complementary;
    const backgroundColor = appColor && themeMainColor[appColor] ? themeMainColor[appColor].regular : undefined;

    badgesCollection[key] = {
      color: backgroundColor,
      icon: app.icon,
    };
  });

  badgesCollection.USERBOOK = {
    color: theme.apps.userbook.accentColors.regular,
    icon: 'userbook-large',
  };

  return badgesCollection;
};

export const normalizeNotificationType = (type: string): string => {
  if (type.startsWith('USERBOOK_')) return 'USERBOOK';
  if (type === 'NEWS') return 'ACTUALITES';
  return type;
};

export const resolveBadgeForNotification = (
  type: string,
  badgesIndex: Record<string, IAppBadgeInfo>,
): IAppBadgeInfo | undefined => {
  const normalized = normalizeNotificationType(type);

  return (
    badgesIndex[normalized] ??
    badgesIndex[type] ?? {
      color: theme.palette.grey.cloudy,
      icon: 'ui-infoCircle',
    }
  );
};

export const getAppBadges = (state: IGlobalState): Record<string, IAppBadgeInfo> => {
  const aggregatedApps = selectAggregatedApps(state);
  return buildAppBadgesIndex(aggregatedApps);
};
