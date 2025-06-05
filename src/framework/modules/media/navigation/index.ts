import type { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/media/module-config';
import type { ImportQueueScreenProps } from '~/framework/modules/media/screens/import-queue/types';

// Caution: `import` is a reserved word, so 'import-queue' will be used a screen name instead.

export interface MediaLibraryNavigationParams extends ParamListBase {
  'import-queue': ImportQueueScreenProps.NavParams;
}

export const mediaLibraryRouteNames = {
  'import-queue': `${moduleConfig.name}/import` as 'import-queue',
};
