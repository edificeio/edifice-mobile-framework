import type { MediacentreReduxState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const MEDIACENTRE = 'mediacentre';

export default new NavigableModuleConfig<string, MediacentreReduxState>({
  displayAs: 'myAppsSecondaryModule',
  displayI18n: 'mediacentre-moduleconfig-appname',
  displayPicture: { name: MEDIACENTRE, type: 'Svg' },
  entcoreScope: [MEDIACENTRE],
  matchEntcoreApp: '/mediacentre',
  name: MEDIACENTRE,
  storageName: MEDIACENTRE,
});
