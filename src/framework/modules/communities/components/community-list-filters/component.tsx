import * as React from 'react';
import { View } from 'react-native';

import CommunityListFilterButton from './community-list-filter-button';
import { styles } from './styles';
import { CommunityListFilterProps } from './types';

import { I18n } from '~/app/i18n';
import SegmentedControl from '~/framework/components/buttons/segmented-control';

const CommunityListFilters: React.FC<CommunityListFilterProps> = ({ pendingInvitationsCount }) => {
  return (
    <View style={styles.filterBar}>
      <SegmentedControl numberOfFilteredItems={pendingInvitationsCount} text={I18n.get('communities-pending-invitations')} />
      <CommunityListFilterButton />
    </View>
  );
};

export default CommunityListFilters;
