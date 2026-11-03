import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import type { CommunityCardSmallProps } from '~/framework/modules/communities/components/community-card-small/types';

import styles from './styles';

const CommunityCardSmallLoader = ({ itemSeparatorStyle }: Readonly<Pick<CommunityCardSmallProps, 'itemSeparatorStyle'>>) => {
  const containerStyle = React.useMemo(() => [styles.container, itemSeparatorStyle], [itemSeparatorStyle]);

  return (
    <View style={containerStyle}>
      <Placeholder Animation={Fade}>
        <PlaceholderMedia style={styles.image} />
        <View style={styles.titleContainer}>
          <PlaceholderLine noMargin style={styles.title} />
        </View>
      </Placeholder>
    </View>
  );
};

export default CommunityCardSmallLoader;
