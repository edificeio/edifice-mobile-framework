import appConf from '~/framework/util/appConf';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'collaborativewall', null>({
  entcoreScope: ['collaborativewall'],

  hasRight: ({ matchingApps }) => appConf.isDevOrAlpha && matchingApps.length > 0,

  matchEntcoreApp: 'CollaborativeWall',

  name: 'collaborativewall',

  storageName: 'collaborativewall',
});
