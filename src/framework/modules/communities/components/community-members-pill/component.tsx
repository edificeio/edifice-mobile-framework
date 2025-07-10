import * as React from 'react';
import { View } from 'react-native';

import { styles } from './styles';
import { CommunityMembersPillProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionText } from '~/framework/components/text';

const CommunityMembersPill = ({ membersCount }: Readonly<CommunityMembersPillProps>) => {
  const memberString = I18n.get(membersCount > 1 ? 'communities-members' : 'communities-member', { count: membersCount });

  return (
    <View style={styles.pillContainer}>
      <Svg
        name="ui-members"
        width={UI_SIZES.elements.icon.xsmall}
        height={UI_SIZES.elements.icon.xsmall}
        fill={theme.palette.grey.black}
      />
      <CaptionText style={styles.membersText}>{memberString}</CaptionText>
    </View>
  );
};

export default CommunityMembersPill;
