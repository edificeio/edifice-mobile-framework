import * as React from 'react';

import ResourceDescriptionLoader from '~/framework/modules/wiki/components/resource-description-loader';
import ResourceThumbnailLoader from '~/framework/modules/wiki/components/resource-thumbnail-loader';

const ResourceHeaderLoader: React.FC = () => {
    return (
        <>
            <ResourceThumbnailLoader />
            <ResourceDescriptionLoader />
        </>
    );
};

export default ResourceHeaderLoader;
