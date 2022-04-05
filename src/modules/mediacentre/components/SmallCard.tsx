import * as React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import { getImageUri } from './FavoritesCarousel';
import { TouchCard } from '~/framework/components/card';
import { Text, TextBold } from '~/framework/components/text';
import { getAuthHeader } from '~/infra/oauth';
import { Icon } from '~/ui';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';
import { SourceImage } from '~/modules/mediacentre/components/BigCard';

const styles = StyleSheet.create({
  mainContainer: {
    width: '50%',
  },
  contentContainer: {
    flexDirection: 'column',
    margin: 5,
  },
  imageContainer: {
    height: 70,
    width: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  titleText: {
    color: '#F53B56',
    flexShrink: 1,
    marginRight: 5,
  },
  secondaryContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 5,
  },
  descriptionText: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

interface IconButtonProps {
  color: string;
  icon: string;
  size: number;

  onPress: () => void;
}

interface FavoriteIconProps {
  resource: Resource;

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

interface SmallCardProps {
  resource: Resource;

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

export const IconButton: React.FunctionComponent<IconButtonProps> = (props: IconButtonProps) => (
  <TouchableOpacity onPress={props.onPress}>
    <Icon size={props.size} color={props.color} name={props.icon} />
  </TouchableOpacity>
);

export const FavoriteIcon: React.FunctionComponent<FavoriteIconProps> = (props: FavoriteIconProps) => {
  const removeFavorite = () => {
    props.removeFavorite(props.resource.id, props.resource.source);
  };
  const addFavorite = () => {
    props.addFavorite(props.resource.id, props.resource);
  };
  return (props.resource.favorite ?
    <IconButton icon='star' size={20} color='#FEC63D' onPress={removeFavorite} />
    :
    <IconButton icon='star' size={20} color='#D6D6D6' onPress={addFavorite} />
  );
}

export const SmallCard: React.FunctionComponent<SmallCardProps> = (props: SmallCardProps) => {
  const openURL = () => {
    Linking.openURL(props.resource.link);
  };
  const copyToClipboard = () => {
    Clipboard.setString(props.resource.link);
  };
  return (
    <View style={styles.mainContainer}>
      <TouchCard onPress={openURL} style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <TextBold numberOfLines={1} style={styles.titleText}>{props.resource.title}</TextBold>
          {props.resource.source !== Source.Signet ? <SourceImage source={props.resource.source} size={18} /> : null}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Image source={{ headers: getAuthHeader(), uri: getImageUri(props.resource.image) }} style={styles.imageContainer} />
          <View style={styles.secondaryContainer}>
            <Text numberOfLines={2} style={styles.descriptionText}>
              {props.resource.source === Source.Signet ? props.resource.owner_name : props.resource.editors}
            </Text>
            <View style={styles.actionsContainer}>
              <FavoriteIcon {...props} />
              <IconButton icon='link' size={20} color='#F53B56' onPress={copyToClipboard} />
            </View>
          </View>
        </View>
      </TouchCard>
    </View>
  );
}
