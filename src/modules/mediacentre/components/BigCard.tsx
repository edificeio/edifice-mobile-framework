import Clipboard from '@react-native-clipboard/clipboard';
import I18n from 'i18n-js';
import * as React from 'react';
import { ColorValue, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import { TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { CaptionText } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
import { IResource, Source } from '~/modules/mediacentre/reducer';

import { ResourceImage, SourceImage } from './ResourceImage';

const styles = StyleSheet.create({
  mainContainer: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.small,
  },
  contentContainer: {
    flexDirection: 'row',
    marginTop: -UI_SIZES.spacing.big,
  },
  cardImage: {
    overflow: 'hidden',
    height: 80,
    width: 80,
    alignSelf: 'center',
  },
  actionsContainer: {
    flexGrow: 1,
    marginLeft: UI_SIZES.spacing.medium,
    justifyContent: 'space-between',
  },
  cardActionIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: UI_SIZES.spacing.tiny,
  },
});

interface IActionButtonProps {
  color?: ColorValue;
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
    <Icon size={20} color={props.color ?? theme.palette.primary.regular} name={props.icon} />
    <CaptionText style={styles.actionText}>{props.text}</CaptionText>
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
    <ActionButton
      icon="star"
      color={theme.palette.complementary.yellow.regular}
      text={I18n.t('mediacentre.remove-favorite')}
      onPress={removeFavorite}
    />
  ) : (
    <ActionButton icon="star" color={theme.palette.grey.grey} text={I18n.t('mediacentre.add-favorite')} onPress={addFavorite} />
  );
};

export class BigCard extends React.PureComponent<IBigCardProps> {
  openUrlCallback = () => {
    if (this.props.resource.source === Source.SIGNET) {
      return openUrl(this.props.resource.link);
    }
    const link = encodeURIComponent(this.props.resource.link);
    openUrl(`${DEPRECATED_getCurrentPlatform()!.url}/mediacentre/resource/open?url=${link}`);
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
