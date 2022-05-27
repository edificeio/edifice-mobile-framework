import Clipboard from '@react-native-clipboard/clipboard';
import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import { TouchableResourceCard } from '~/framework/components/card';
import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

import { ResourceImage, SourceImage } from './ResourceImage';

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
  color?: string;
  icon: string;
  text: string;

  onPress: () => void;
}

interface FavoriteActionProps {
  resource: Resource;

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

interface BigCardProps {
  resource: Resource;

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

const ActionButton: React.FunctionComponent<ActionButtonProps> = (props: ActionButtonProps) => (
  <TouchableOpacity style={styles.cardActionIcon} onPress={props.onPress}>
    <Icon size={20} color={props.color || theme.color.secondary.regular} name={props.icon} />
    <Text style={styles.actionText}>{props.text}</Text>
  </TouchableOpacity>
);

const FavoriteAction: React.FunctionComponent<FavoriteActionProps> = (props: FavoriteActionProps) => {
  const removeFavorite = () => {
    props.removeFavorite(props.resource.id, props.resource.source);
    props.resource.favorite = false;
  };
  const addFavorite = () => {
    props.addFavorite(props.resource.id, props.resource);
    props.resource.favorite = true;
  };
  return props.resource.favorite ? (
    <ActionButton icon="star" color="#FEC63D" text={I18n.t('mediacentre.remove-favorite')} onPress={removeFavorite} />
  ) : (
    <ActionButton icon="star" color="#D6D6D6" text={I18n.t('mediacentre.add-favorite')} onPress={addFavorite} />
  );
};

export const BigCard: React.FunctionComponent<BigCardProps> = (props: BigCardProps) => {
  const openURL = () => {
    openUrl(props.resource.link);
  };
  const copyToClipboard = () => {
    Clipboard.setString(props.resource.link);
    Toast.show(I18n.t('mediacentre.link-copied'));
  };
  return (
    <TouchableResourceCard title={props.resource.title} onPress={openURL} style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        <ResourceImage image={props.resource.image} style={styles.cardImage} resizeMode="contain" />
        <View style={styles.actionsContainer}>
          <FavoriteAction {...props} />
          <ActionButton icon="link" text={I18n.t('mediacentre.copy-link')} onPress={copyToClipboard} />
        </View>
        {props.resource.source !== Source.SIGNET ? <SourceImage source={props.resource.source} size={25} /> : null}
      </View>
    </TouchableResourceCard>
  );
};
