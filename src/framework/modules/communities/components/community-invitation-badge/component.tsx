import * as React from 'react';
import { View } from 'react-native';

import { SmallBoldText } from '~/framework/components/text';
import { I18n } from '~/util/i18n';

import { styles } from './styles';

const CommunityInvitationBadge = () => {
  return (
    <View style={styles.badgeContainer}>
      <SmallBoldText style={styles.badgeText}>{I18n.get('communities-badge-new')}</SmallBoldText>
    </View>
  );
};

export default CommunityInvitationBadge;
