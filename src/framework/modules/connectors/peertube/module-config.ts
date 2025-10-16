import theme from '~/app/theme';
import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const PEERTUBE = 'peertube';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'peertube-moduleconfig-appname',
  displayPicture: { fill: theme.palette.complementary.red.regular, name: PEERTUBE, type: 'Svg' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toLowerCase().includes(PEERTUBE),
  name: PEERTUBE,
  storageName: PEERTUBE,
});
