import React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import { AvatarSizes } from '~/framework/components/avatar/styles';
import styles from '~/framework/components/card/visible-item/styles';
import { VisibleItemLoaderProps } from '~/framework/components/card/visible-item/types';
import { UI_SIZES } from '~/framework/components/constants';

const VisibleItemLoader = ({ avatarSize = 'md', backgroundColor, children }: Readonly<VisibleItemLoaderProps>) => {
  const avatarWidth = React.useMemo(() => {
    return AvatarSizes[avatarSize] + UI_SIZES.border.small * 2;
  }, [avatarSize]);

  const containerStyle = React.useMemo(() => {
    return [styles.container, backgroundColor && { backgroundColor }];
  }, [backgroundColor]);

  return (
    <View style={containerStyle}>
      <View style={[styles.flex0, { width: avatarWidth }]}>
        <Placeholder Animation={Fade}>
          <PlaceholderMedia isRound size={avatarWidth} />
        </Placeholder>
      </View>
      <View style={styles.flex1}>{children}</View>
    </View>
  );
};

export default VisibleItemLoader;
