import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import { CommunityCardSmallProps } from '~/framework/modules/communities/components/community-card-small';

import { styles } from './styles';

const CommunityCardSmallLoader = ({ itemSeparatorStyle }: Readonly<Pick<CommunityCardSmallProps, 'itemSeparatorStyle'>>) => {
  const containerStyle = React.useMemo(() => {
    return [styles.loaderCardContainer, itemSeparatorStyle];
  }, [itemSeparatorStyle]);

  return (
    <View style={containerStyle}>
      <Placeholder Animation={Fade}>
        <PlaceholderMedia style={styles.loaderCard} />
      </Placeholder>
    </View>
  );
};

export default CommunityCardSmallLoader;
