import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { DocumentsTileProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';

const DocumentsTile = ({ communityId, navigation }: Readonly<DocumentsTileProps>) => (
  <TouchableOpacity
    style={styles.tileDocuments}
    onPress={React.useCallback(
      () => navigation.navigate(communitiesRouteNames.documents, { communityId }),
      [communityId, navigation],
    )}
    testID="tile-docs">
    <View style={styles.largeTileIcon}>
      <Svg
        name="ui-folder"
        width={UI_SIZES.elements.icon.default}
        height={UI_SIZES.elements.icon.default}
        fill={theme.ui.text.inverse}
      />
    </View>
    <SmallBoldText style={styles.tileCaptionTextAvailable}>{I18n.get('communities-tile-documents-title')}</SmallBoldText>
    <SmallText style={styles.tileCaptionDescriptionAvailable} />
  </TouchableOpacity>
);

export default DocumentsTile;
