import * as React from 'react';

import { styles } from './styles';
import { ResourceThumbnailProps } from './types';

import ModuleImage from '~/framework/components/picture/module-image';
import moduleConfig from '~/framework/modules/wiki/module-config';

const ResourceThumbnail: React.FC<ResourceThumbnailProps> = ({ imageSource }) => {
    return <ModuleImage moduleConfig={moduleConfig} source={imageSource} style={styles.resourceThumbnailContainer} />;
};

export default ResourceThumbnail;
