import React from 'react';
import { View } from 'react-native';

import { TouchCardWithoutPadding } from '~/framework/components/card/base';
import { UI_STYLES } from '~/framework/components/constants';
import { CaptionText, SmallActionText } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';
import { Image } from '~/framework/util/media';

import styles from './styles';
import { ResourceListItemProps } from './types';

const ResourceListItem: React.FunctionComponent<ResourceListItemProps> = ({ resource }) => {
  const handlePress = () => openUrl(resource.url);

  return (
    <TouchCardWithoutPadding onPress={handlePress} style={styles.mainContainer}>
      <Image source={{ uri: resource.pictureUrl }} style={styles.imageContainer} resizeMode="contain" />
      <View style={styles.rightContainer}>
        <SmallActionText numberOfLines={3}>{resource.name}</SmallActionText>
        <CaptionText style={UI_STYLES.flexShrink1}>{resource.description}</CaptionText>
      </View>
    </TouchCardWithoutPadding>
  );
};

export default ResourceListItem;
