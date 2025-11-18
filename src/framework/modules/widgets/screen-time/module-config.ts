import theme from '~/app/theme';
import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'screenTime', null>({
  displayAs: ModuleType.MYAPPS_WIDGET,
  displayColor: theme.palette.complementary.orange,
  displayI18n: 'widget-screen-time-title',
  displayPicture: { name: 'ui-widget-screen-time', type: 'Svg' },
  entcoreScope: ['appregistry'],
  hasRight: param => param.matchingWidgets.length > 0,
  matchEntcoreApp: () => true,
  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'screen-time-widget',
  name: 'screenTime',
  storageName: 'screenTime',
});
