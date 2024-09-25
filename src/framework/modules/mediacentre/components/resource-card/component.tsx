import Clipboard from '@react-native-clipboard/clipboard';
import * as React from 'react';
import { memo, useState } from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { TouchCard } from '~/framework/components/card/base';
import { CaptionText, SmallBoldText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import { SourceImage } from '~/framework/modules/mediacentre/components/ResourceImage';
import { Source } from '~/framework/modules/mediacentre/model';
import { openUrl } from '~/framework/util/linking';
import { Image } from '~/framework/util/media';

import styles from './styles';
import { ResourceCardProps } from './types';

const ResourceCard: React.FunctionComponent<ResourceCardProps> = ({ resource, onAddFavorite, onRemoveFavorite }) => {
  const [isFavorite, setFavorite] = useState(resource.favorite);

  const handlePress = () => {
    if (resource.source === Source.SIGNET) {
      openUrl(resource.link);
    } else {
      const link = encodeURIComponent(resource.link);
      const session = getSession();
      if (!session) return;
      openUrl(`${session.platform.url}/mediacentre/resource/open?url=${link}`);
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(resource.link);
    Toast.showInfo(I18n.get('mediacentre-home-linkcopied'));
  };

  const handleAddFavorite = () => {
    setFavorite(true);
    onAddFavorite();
  };

  const handleRemoveFavorite = () => {
    setFavorite(false);
    onRemoveFavorite();
  };

  return (
    <TouchCard onPress={handlePress} style={styles.mainContainer}>
      <View style={styles.upperContentContainer}>
        <SmallBoldText numberOfLines={1} style={styles.titleText}>
          {resource.title}
        </SmallBoldText>
        {resource.source !== Source.SIGNET ? <SourceImage source={resource.source} size={18} /> : null}
      </View>
      <View style={styles.lowerContentContainer}>
        <Image source={{ uri: resource.image }} style={styles.imageContainer} />
        <View style={styles.secondaryContainer}>
          <CaptionText numberOfLines={2}>{resource.source === Source.SIGNET ? resource.authors : resource.editors}</CaptionText>
          <View style={styles.actionsContainer}>
            <IconButton icon="ui-copy" action={handleCopyLink} />
            <IconButton
              icon="ui-star-filled"
              color={isFavorite ? theme.palette.complementary.yellow.regular : theme.palette.grey.grey}
              action={isFavorite ? handleRemoveFavorite : handleAddFavorite}
            />
          </View>
        </View>
      </View>
    </TouchCard>
  );
};

export default memo(ResourceCard);
