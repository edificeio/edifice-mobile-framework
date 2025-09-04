import * as React from 'react';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

const DocumentsTileLoader = () => (
  <Placeholder Animation={Fade}>
    <PlaceholderMedia style={styles.tileLoader} />
  </Placeholder>
);

export default DocumentsTileLoader;
