import * as React from 'react';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import { styles } from './styles';

const ResourceThumbnailLoader: React.FC = () => {
    return (
        <Placeholder Animation={Fade}>
            <PlaceholderMedia style={styles.resourceLoaderContent} />
        </Placeholder>
    );
};

export default ResourceThumbnailLoader;
