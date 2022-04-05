import * as React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Linking } from 'react-native';

import { getImageUri } from './FavoritesCarousel';
import { Text } from '~/framework/components/text';
import { TouchableResourceCard } from '~/framework/components/card';
import { getAuthHeader } from '~/infra/oauth';
import { Icon } from '~/ui';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

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
});

interface ActionButtonProps {
  color: string;
  icon: string;
  text: string;

  onPress: () => void;
}

interface SourceImageProps {
  size: number;
  source: Source;
}

interface BigCardProps {
  resource: Resource;
}

const ActionButton: React.FunctionComponent<ActionButtonProps> = (props: ActionButtonProps) => (
  <TouchableOpacity style={styles.cardActionIcon} onPress={props.onPress}>
    <Icon size={20} color={props.color} name={props.icon} />
    <Text style={styles.actionText}>{props.text}</Text>
  </TouchableOpacity>
);

export const SourceImage: React.FunctionComponent<SourceImageProps> = (props: SourceImageProps) => {
  const image = (props.source === Source.GAR) ? require('ASSETS/images/logo-gar.png') : require('ASSETS/images/logo-moodle.png');
  return (<Image source={image} style={{ height: props.size, width: props.size, alignSelf: 'flex-end' }} resizeMode="contain" />);
}

export const BigCard: React.FunctionComponent<BigCardProps> = (props: BigCardProps) => (
  <TouchableResourceCard title={props.resource.title} onPress={() => Linking.openURL(props.resource.link)} style={styles.mainContainer}>
    <View style={styles.contentContainer}>
      <Image source={{ headers: getAuthHeader(), uri: getImageUri(props.resource.image) }} style={styles.cardImage} resizeMode="contain" />
      <View style={styles.actionsContainer}>
        <ActionButton icon='star' color='yellow' text='Ajouter aux favoris' onPress={() => true} />
        <ActionButton icon="star" color="red" text="Copier le lien" onPress={() => true} />
      </View>
      {props.resource.source !== Source.Signet ? <SourceImage source={props.resource.source} size={25} /> : null}
    </View>
  </TouchableResourceCard>
);
