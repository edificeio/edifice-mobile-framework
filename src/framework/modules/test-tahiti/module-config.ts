import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'testTahiti', null>({
  name: 'testTahiti',
  entcoreScope: [
    /* @scaffolder add there entcore scope list that be required for your module */
  ],
  matchEntcoreApp: entcoreApp => true, // @scaffolder Replace this with a function that returns boolean regarding of the given entcoreApp

  displayI18n: 'testTahiti.tabName',
  displayAs: 'tabModule',
  displayOrder: 0,
  displayPicture: { type: 'NamedSvg', name: 'ui-tool' },
});
