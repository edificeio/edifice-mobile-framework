import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const CREATIVESCHOOL = 'creativeschool';

export default new NavigableModuleConfig<'creativeschool', null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'creativeschool-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/creativeschool.png'), type: 'Image' },
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toLocaleLowerCase().includes('edifice')),
  matchEntcoreApp: 'Creativeschool',
  name: CREATIVESCHOOL,
  storageName: CREATIVESCHOOL,
});
