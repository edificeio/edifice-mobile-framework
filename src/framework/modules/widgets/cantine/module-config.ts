import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'cantine', null>({
  displayAs: 'myAppsWidgets',
  displayI18n: 'widget-cantine.tabName',
  displayPicture: { fill: theme.palette.complementary.orange.regular, name: 'ui-widget', type: 'Svg' },
  entcoreScope: ['appregistry'],
  matchEntcoreApp: () => true,
  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'cantine-widget',
  name: 'cantine',
  storageName: 'cantine',
});
