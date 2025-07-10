import * as React from 'react';
import { View } from 'react-native';

import { styles } from './styles';

import { I18n } from '~/app/i18n';
import { SmallBoldText } from '~/framework/components/text';

const CommunityInvitationBadge = () => {
  return (
    <View style={styles.badgeContainer}>
      <SmallBoldText style={styles.badgeText}>{I18n.get('communities-badge-new')}</SmallBoldText>
    </View>
  );
};

export default CommunityInvitationBadge;
