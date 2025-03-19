import * as React from 'react';

import { ResourceHeaderProps } from './types';

import ResourceDescription from '~/framework/modules/wiki/components/resource-description';
import ResourceHeaderLoader from '~/framework/modules/wiki/components/resource-header-loader';
import ResourceThumbnail from '~/framework/modules/wiki/components/resource-thumbnail';

const ResourceHeader: React.FC<ResourceHeaderProps> = ({ canAddDescription = false, description, image }) => {
    const [isCardExpanded, setIsCardExpanded] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    const toggleLoadingState = React.useCallback(() => {
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        if (isLoading) {
            toggleLoadingState();
        }
    }, [isLoading, toggleLoadingState]);

    if (isLoading) {
        return <ResourceHeaderLoader />;
    }

    return (
        <>
            <ResourceThumbnail imageSource={image} />
            <ResourceDescription content={description} expanded={isCardExpanded} onToggleVisibility={setIsCardExpanded} />
        </>
    );
};

export default ResourceHeader;
