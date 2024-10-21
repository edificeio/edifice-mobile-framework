import appConf from '~/framework/util/appConf';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'collaborativewall', null>({
  // Remove this line when this modules goes in production !
  displayI18n: 'collaborativewall-tabname',

  entcoreScope: ['collaborativewall'],

  hasRight: (matchingApps, matchingWidgets) => appConf.isDevOrAlpha && matchingApps.length > 0,

  matchEntcoreApp: '/collaborativewall',

  name: 'collaborativewall',

  storageName: 'collaborativewall',
});
