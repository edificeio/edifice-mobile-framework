import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import styles from './styles';
import { DocumentsTileProps } from './types';

import { I18n } from '~/app/i18n';
import { AvatarStack } from '~/framework/components/avatar/stack';
import { UI_STYLES } from '~/framework/components/constants';
import { SmallBoldText } from '~/framework/components/text';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';

const MembersTile = ({ communityId, membersId, navigation, totalMembers }: Readonly<DocumentsTileProps>) => (
  <TouchableOpacity
    style={styles.tileMembers}
    onPress={React.useCallback(
      () => navigation.navigate(communitiesRouteNames.members, { communityId }),
      [communityId, navigation],
    )}>
    <AvatarStack style={UI_STYLES.flex1} size="md" items={membersId} total={totalMembers} />
    <SmallBoldText style={styles.tileCaptionTextAvailable}>{I18n.get('communities-tile-members-title')}</SmallBoldText>
  </TouchableOpacity>
);

export default MembersTile;
