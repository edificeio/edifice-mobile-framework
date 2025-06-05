import theme from '~/app/theme';
import appConf from '~/framework/util/appConf';
import { ModuleConfig } from '~/framework/util/moduleTool';

export const moduleColor = appConf.is1d ? theme.palette.complementary.orange : theme.palette.complementary.indigo;

export default new ModuleConfig<'media-library', null>({
  entcoreScope: [],
  hasRight: () => true,
  matchEntcoreApp: () => false,

  name: 'media-library',
  storageName: 'media-library',
});
