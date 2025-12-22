import { AppsInfo } from './types';

import { PictureProps } from '~/framework/components/picture';
import {
  AnyNavigableModule,
  AnyNavigableModuleConfig,
  dynamiclyRegisterModules,
  INavigableModuleConfigDeclaration,
  NavigableModuleArray,
} from '~/framework/util/moduleTool';

function buildDisplayPicture(app: AppsInfo): PictureProps | undefined {
  if (!app.icon) return undefined;

  if (app.icon.startsWith('http') || app.icon.startsWith('/')) {
    return {
      source: { uri: app.icon },
      type: 'Image',
    } as const;
  }

  return {
    name: app.icon,
    type: 'Icon',
  } as const;
}

export function applyAppsToModules(modules: NavigableModuleArray<AnyNavigableModule>, apps: AppsInfo[]) {
  const appsByName = new Map(apps.map(a => [a.name, a]));

  modules.forEach(module => {
    const app = appsByName.get(module.config.name);
    const config = module.config as AnyNavigableModuleConfig;

    const navConfig = config as {
      assignValues: (values: Partial<INavigableModuleConfigDeclaration<string>>) => void;
    };

    if (!app || !app.display) {
      navConfig.assignValues({
        displayAs: undefined,
      });
      return;
    }
    const displayAs = app.type === 'connector' ? 'myAppsConnector' : 'myAppsModule';
    navConfig.assignValues({
      displayAs,

      displayI18n: app.displayName,
      displayPicture: buildDisplayPicture(app),
    });
  });

  dynamiclyRegisterModules(modules);
}
