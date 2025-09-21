import { CantineState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'cantine', CantineState>({
  displayAs: 'myAppsWidgets',
  displayI18n: 'widget-cantine-title',
  displayPicture: { name: 'ui-widget-cantine', type: 'Svg' },
  entcoreScope: ['appregistry'],
  hasRight: param => param.matchingWidgets.length > 0,
  matchEntcoreApp: () => true,
  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'cantine-widget',
  name: 'cantine',
  storageName: 'cantine',
});
