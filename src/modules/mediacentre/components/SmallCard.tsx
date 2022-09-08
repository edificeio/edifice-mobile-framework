import Clipboard from '@react-native-clipboard/clipboard';
import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import { TouchCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallBoldText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
import { ResourceImage, SourceImage } from '~/modules/mediacentre/components/ResourceImage';
import { IResource, Source } from '~/modules/mediacentre/reducer';

const styles = StyleSheet.create({
  upperContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.tiny,
  },
  titleText: {
    color: theme.palette.primary.regular,
    flexShrink: 1,
    marginRight: UI_SIZES.spacing.tiny,
  },
  lowerContentContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    height: 70,
    width: 50,
  },
  secondaryContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: UI_SIZES.spacing.minor,
  },
  descriptionText: {
    ...TextSizeStyle.Small,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

interface IIconButtonProps {
  color?: string;
  icon: string;
  size: number;

  onPress: () => void;
}

interface IFavoriteIconProps {
  resource: IResource;

  addFavorite: (id: string, resource: IResource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

interface ISmallCardProps {
  resource: IResource;

  addFavorite: (id: string, resource: IResource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

export const IconButton: React.FunctionComponent<IIconButtonProps> = (props: IIconButtonProps) => (
  <TouchableOpacity onPress={props.onPress}>
    <Icon size={props.size} color={props.color || theme.palette.primary.regular} name={props.icon} />
  </TouchableOpacity>
);

export const FavoriteIcon: React.FunctionComponent<IFavoriteIconProps> = (props: IFavoriteIconProps) => {
  const removeFavorite = () => {
    props.removeFavorite(props.resource.id, props.resource.source);
  };
  const addFavorite = () => {
    props.addFavorite(props.resource.id, props.resource);
  };
  return props.resource.favorite ? (
    <IconButton icon="star" size={20} color="#FEC63D" onPress={removeFavorite} />
  ) : (
    <IconButton icon="star" size={20} color="#D6D6D6" onPress={addFavorite} />
  );
};

export class SmallCard extends React.PureComponent<ISmallCardProps> {
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
      <TouchCard onPress={this.openUrlCallback}>
        <View style={styles.upperContentContainer}>
          <SmallBoldText numberOfLines={1} style={styles.titleText}>
            {resource.title}
          </SmallBoldText>
          {resource.source !== Source.SIGNET ? <SourceImage source={resource.source} size={18} /> : null}
        </View>
        <View style={styles.lowerContentContainer}>
          <ResourceImage image={resource.image} style={styles.imageContainer} />
          <View style={styles.secondaryContainer}>
            <SmallText numberOfLines={2} style={styles.descriptionText}>
              {resource.source === Source.SIGNET ? resource.authors : resource.editors}
            </SmallText>
            <View style={styles.actionsContainer}>
              <FavoriteIcon {...this.props} />
              <IconButton icon="link" size={20} onPress={this.copyToClipboard} />
            </View>
          </View>
        </View>
      </TouchCard>
    );
  }
}
