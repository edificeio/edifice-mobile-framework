import * as React from 'react';

import { styles } from './styles';
import { ResourceThumbnailProps } from './types';

import ModuleImage from '~/framework/components/picture/module-image';
import moduleConfig from '~/framework/modules/wiki/module-config';

export const ResourceThumbnail: React.FC<ResourceThumbnailProps> = ({ source }) => {
  return <ModuleImage moduleConfig={moduleConfig} source={source} style={styles.resourceThumbnailContainer} />;
};
