import React from 'react';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { ImageProps } from './types';

export const ImagePlaceholder = ({ style, testID }: ImageProps) => {
  return (
    <Placeholder Animation={Fade} style={React.useMemo(() => [style, styles.placeholderWrapper], [style])} testID={testID}>
      <PlaceholderMedia style={styles.placeholder} />
    </Placeholder>
  );
};
