import Clipboard from '@react-native-clipboard/clipboard';
import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import { TouchableResourceCard } from '~/framework/components/card';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextSizeStyle } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';
import { IResource, Source } from '~/modules/mediacentre/utils/Resource';

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
    ...TextSizeStyle.Small,
    marginLeft: 5,
  },
});

interface IActionButtonProps {
  color?: string;
  icon: string;
  text: string;

  onPress: () => void;
}

interface IFavoriteActionProps {
  resource: IResource;

  addFavorite: (id: string, resource: IResource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

interface IBigCardProps {
  resource: IResource;

  addFavorite: (id: string, resource: IResource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

const ActionButton: React.FunctionComponent<IActionButtonProps> = (props: IActionButtonProps) => (
  <TouchableOpacity style={styles.cardActionIcon} onPress={props.onPress}>
    <Icon size={20} color={props.color || theme.palette.primary.regular} name={props.icon} />
    <Text style={styles.actionText}>{props.text}</Text>
  </TouchableOpacity>
);

const FavoriteAction: React.FunctionComponent<IFavoriteActionProps> = (props: IFavoriteActionProps) => {
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

export class BigCard extends React.PureComponent<IBigCardProps> {
  openUrlCallback = () => {
    openUrl(this.props.resource.link);
  };

  copyToClipboard = () => {
    Clipboard.setString(this.props.resource.link);
    Toast.show(I18n.t('mediacentre.link-copied'));
  };

  public render() {
    const { resource } = this.props;
    return (
      <TouchableResourceCard title={resource.title} onPress={this.openUrlCallback} style={styles.mainContainer}>
        <View style={styles.contentContainer}>
          <ResourceImage image={resource.image} style={styles.cardImage} resizeMode="contain" />
          <View style={styles.actionsContainer}>
            <FavoriteAction {...this.props} />
            <ActionButton icon="link" text={I18n.t('mediacentre.copy-link')} onPress={this.copyToClipboard} />
          </View>
          {resource.source !== Source.SIGNET ? <SourceImage source={resource.source} size={25} /> : null}
        </View>
      </TouchableResourceCard>
    );
  }
}
