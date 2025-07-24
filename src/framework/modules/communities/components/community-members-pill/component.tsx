import * as React from 'react';
import { View } from 'react-native';

import { styles } from './styles';
import { CommunityMembersPillProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionText } from '~/framework/components/text';

const CommunityMembersPill = ({ membersCount }: CommunityMembersPillProps) => {
  const memberString = membersCount > 1 ? I18n.get('communities-members') : I18n.get('communities-member');
  return (
    <View style={styles.pillContainer}>
      <Svg
        name="ui-members"
        width={UI_SIZES.elements.icon.xsmall}
        height={UI_SIZES.elements.icon.xsmall}
        fill={theme.palette.grey.black}
      />
      <CaptionText style={styles.membersText}>
        {membersCount} {memberString}
      </CaptionText>
    </View>
  );
};

export default CommunityMembersPill;
