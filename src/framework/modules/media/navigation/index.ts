import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/media/module-config';
import type { ImportQueueScreenProps } from '~/framework/modules/media/screens/import-queue/types';
import { IMedia } from '~/framework/util/media';

// Caution: `import` is a reserved word, so 'import-queue' will be used a screen name instead.

export const mediaRouteNames = {
  'import-queue': `${moduleConfig.name}/import` as 'import-queue',
};

export interface MediaNavigationParams extends ParamListBase {
  'import-queue': ImportQueueScreenProps.NavParams;
}

export interface PromiseScreensData {
  'import-queue': ImportQueueScreenProps.PromiseData;
}

export interface PromiseScreensResolveType {
  'import-queue': IMedia[];
}
