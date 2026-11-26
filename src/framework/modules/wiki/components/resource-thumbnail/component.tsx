import * as React from 'react';

import ModuleImage from '~/framework/components/picture/module-image';

import { styles } from './styles';
import { WikiResourceThumbnailProps } from './types';

const WikiResourceThumbnail: React.FC<WikiResourceThumbnailProps> = ({ source }) => {
  return <ModuleImage moduleName="wiki" source={source} style={styles.resourceThumbnailContainer} />;
};

export default WikiResourceThumbnail;
