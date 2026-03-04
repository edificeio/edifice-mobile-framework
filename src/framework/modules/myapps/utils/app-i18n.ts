import { I18n } from '~/app/i18n';
import { AppsInfo } from '~/framework/modules/myapps/types.ts';

export const getAppName = (data: AppsInfo): string => {
  return data.prefix ? I18n.get(data.prefix.substring(1)) : I18n.get(data.displayName) || '';
};
