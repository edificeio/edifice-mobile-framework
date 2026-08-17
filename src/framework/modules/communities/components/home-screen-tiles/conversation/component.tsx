import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import Pill from '~/framework/components/pill';
import { SmallBoldText } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';

import styles from './styles';
import { ConversationTileProps } from './types';

const ConversationTile = ({ communityId, hasDiscussions, platformUrl }: Readonly<ConversationTileProps>) => {
  const redirectToWeb = React.useCallback(() => {
    openUrl(`${platformUrl}/communities/id/${communityId}/discussions`);
  }, [communityId, platformUrl]);

  const Wrapper = hasDiscussions ? TouchableOpacity : View;
  const tileStyle = hasDiscussions ? styles.tileConversationAvailable : styles.tileConversationUnavailable;
  const captionTextStyle = hasDiscussions ? styles.tileCaptionTextAvailable : styles.tileCaptionTextUnavailable;

  return (
    <Wrapper style={tileStyle} onPress={redirectToWeb} testID="tile-conversations">
      <View style={styles.tileCaption}>
        <Svg
          name="ui-messageInfo"
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
          fill={captionTextStyle.color}
        />
        <SmallBoldText style={captionTextStyle}>{I18n.get('communities-tile-conversations-title')}</SmallBoldText>
      </View>
      {!hasDiscussions && <Pill text={I18n.get('communities-tile-soon')} color={theme.palette.grey.stone} />}
    </Wrapper>
  );
};

export default ConversationTile;
