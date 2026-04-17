import { I18n } from '~/app/i18n';
import { AppsInfo } from '~/framework/modules/myapps/types.ts';

export const getAppName = (data: AppsInfo): string => {
  if (data.prefix) {
    const prefixKey = `myapps-app-${data.prefix.substring(1)}`;
    const name = I18n.get(prefixKey);
    if (name && name !== prefixKey) {
      return name;
    }
  }

  if (data.displayName) {
    const displayNameKey = `myapps-app-${data.displayName}`;
    let name = I18n.get(displayNameKey);
    if (name && name !== displayNameKey) {
      return name;
    }

    name = I18n.get(data.displayName);
    if (name && name !== data.displayName) {
      return name;
    }

    return data.displayName;
  }

  return data.name || '';
};

export const getAppTestID = (data: { testID?: string }): string => {
  return data.testID || '';
};

export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const toKebabCase = (str: string): string => {
  const withCamelCase = str.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
  return normalizeString(withCamelCase)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};
