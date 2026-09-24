import { I18n } from '~/app/i18n';
import { svgExists, SvgIconName } from '~/framework/components/picture';
import { NotificationFilter } from '~/framework/modules/home/reducer/notif-definitions/notif-filters';
import type { IEntcoreNotificationType } from '~/framework/modules/home/reducer/notif-definitions/notif-types';
import type { NotificationFilterItem } from '~/framework/modules/home/templates/notification-filters';
import { getAppLookupMap } from '~/framework/modules/myapps/hooks/lookup';
import { resolveAppColor } from '~/framework/modules/myapps/reducer';
import type { AppsInfoAggregated } from '~/framework/modules/myapps/types';

interface NotificationFamilyOverride {
  app?: string;
  color?: NonNullable<AppsInfoAggregated['color']>;
  icon?: SvgIconName;
}

const compareByLabel = (one: NotificationFilter, other: NotificationFilter) =>
  I18n.get(one.i18n).localeCompare(I18n.get(other.i18n), I18n.getLanguage());

const asIconName = (name?: string): SvgIconName | undefined => (name && svgExists(name) ? (name as SvgIconName) : undefined);

// Todo: include when refactoring myapps module for better app lookup and color resolution
const NOTIFICATION_FAMILY_OVERRIDE: Readonly<Partial<Record<string, NotificationFamilyOverride>>> = {
  TIMELINE: { color: 'yellow', icon: 'report' },
  USERBOOK: { app: 'Directory' },
};

export const buildFilterItems = (
  filters: ReadonlyArray<NotificationFilter>,
  appsByName: Readonly<Record<string, AppsInfoAggregated>>,
  notifTypes: ReadonlyArray<IEntcoreNotificationType>,
): ReadonlyArray<NotificationFilterItem> => {
  const appsByAlias = getAppLookupMap(appsByName);

  return [...filters].sort(compareByLabel).map(filter => {
    const override: NotificationFamilyOverride = NOTIFICATION_FAMILY_OVERRIDE[filter.type] ?? {};

    const typeWithApp = notifTypes.find(one => one.type === filter.type && one['app-name']);
    const appName = filter['app-name'] ?? typeWithApp?.['app-name'] ?? override.app;
    const app = appName ? (appsByName[appName] ?? appsByAlias.get(appName)) : undefined;

    return {
      color: resolveAppColor(override.color ?? app?.color),
      icon: override.icon ?? asIconName(app?.icon),
      id: filter.type,
      labelI18n: filter.i18n,
    };
  });
};
