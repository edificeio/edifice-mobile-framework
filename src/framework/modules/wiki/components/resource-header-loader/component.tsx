import * as React from 'react';

import ResourceThumbnail from '~/framework/modules/wiki/components//resource-thumbnail';
import ResourceDescriptionLoader from '~/framework/modules/wiki/components/resource-description-loader';

const ResourceHeaderLoader: React.FC = () => {
  return (
    <>
      <ResourceThumbnail />
      <ResourceDescriptionLoader />
    </>
  );
};

export default ResourceHeaderLoader;
