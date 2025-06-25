import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'communities', null>({
  displayAs: 'tabModule',
  displayI18n: 'communities.tabName',
  displayOrder: 3,
  displayPicture: { name: 'ui-tool', type: 'Svg' },
  displayPictureFocus: { name: 'ui-tool', type: 'Svg' },

  entcoreScope: ['communities'],
  matchEntcoreApp: '/Communities', // wtf uppercase C is mandatory for this one (weird conf expected)

  name: 'communities',
  storageName: 'communities',
});
