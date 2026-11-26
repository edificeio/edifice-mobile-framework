import * as React from 'react';

import WikiResourceDescriptionLoader from '~/framework/modules/wiki/components/resource-description-loader';
import WikiResourceThumbnail from '~/framework/modules/wiki/components/resource-thumbnail';

const WikiResourceHeaderLoader: React.FC = () => {
  return (
    <>
      <WikiResourceThumbnail />
      <WikiResourceDescriptionLoader />
    </>
  );
};

export default WikiResourceHeaderLoader;
