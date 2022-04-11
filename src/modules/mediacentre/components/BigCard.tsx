import Clipboard from '@react-native-clipboard/clipboard';
import I18n from 'i18n-js';
import * as React from 'react';
import { Image, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

import { TouchableResourceCard } from '~/framework/components/card';
import { Text } from '~/framework/components/text';
import { getAuthHeader } from '~/infra/oauth';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';
import { Icon } from '~/ui';

import { getImageUri } from './FavoritesCarousel';

const styles = StyleSheet.create({
  mainContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  contentContainer: {
    flexDirection: 'row',
    marginTop: -20,
  },
  cardImage: {
    height: 80,
    width: 80,
    alignSelf: 'center',
  },
  actionsContainer: {
    flexGrow: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  cardActionIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    fontSize: 12,
  },
  sourceImageContainer: {
    alignSelf: 'flex-end',
  },
});

interface ActionButtonProps {
  color: string;
  icon: string;
  text: string;

  onPress: () => void;
}

interface FavoriteActionProps {
  resource: Resource;

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

interface SourceImageProps {
  size: number;
  source: Source;
}

interface BigCardProps {
  resource: Resource;

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

const ActionButton: React.FunctionComponent<ActionButtonProps> = (props: ActionButtonProps) => (
  <TouchableOpacity style={styles.cardActionIcon} onPress={props.onPress}>
    <Icon size={20} color={props.color} name={props.icon} />
    <Text style={styles.actionText}>{props.text}</Text>
  </TouchableOpacity>
);

const FavoriteAction: React.FunctionComponent<FavoriteActionProps> = (props: FavoriteActionProps) => {
  const removeFavorite = () => {
    props.removeFavorite(props.resource.id, props.resource.source);
  };
  const addFavorite = () => {
    props.addFavorite(props.resource.id, props.resource);
  };
  return props.resource.favorite ? (
    <ActionButton icon="star" color="#FEC63D" text={I18n.t('mediacentre.remove-favorite')} onPress={removeFavorite} />
  ) : (
    <ActionButton icon="star" color="#D6D6D6" text={I18n.t('mediacentre.add-favorite')} onPress={addFavorite} />
  );
};

export const SourceImage: React.FunctionComponent<SourceImageProps> = (props: SourceImageProps) => {
  let image;
  switch (props.source) {
    case Source.GAR:
      image = require('ASSETS/images/logo-gar.png');
      break;
    case Source.Moodle:
      image = require('ASSETS/images/logo-moodle.png');
      break;
    case Source.PMB:
      image = require('ASSETS/images/logo-pmb.png');
      break;
    default:
      image = require('ASSETS/images/logo-gar.png');
      break;
  }
  return (
    <Image source={image} style={[styles.sourceImageContainer, { height: props.size, width: props.size }]} resizeMode="contain" />
  );
};

export const BigCard: React.FunctionComponent<BigCardProps> = (props: BigCardProps) => {
  const openURL = () => {
    Linking.openURL(props.resource.link);
  };
  const copyToClipboard = () => {
    Clipboard.setString(props.resource.link);
  };
  return (
    <TouchableResourceCard title={props.resource.title} onPress={openURL} style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        <Image
          source={{ headers: getAuthHeader(), uri: getImageUri(props.resource.image) }}
          style={styles.cardImage}
          resizeMode="contain"
        />
        <View style={styles.actionsContainer}>
          <FavoriteAction {...props} />
          <ActionButton icon="link" color="#F53B56" text={I18n.t('mediacentre.copy-link')} onPress={copyToClipboard} />
        </View>
        {props.resource.source !== Source.Signet ? <SourceImage source={props.resource.source} size={25} /> : null}
      </View>
    </TouchableResourceCard>
  );
};
