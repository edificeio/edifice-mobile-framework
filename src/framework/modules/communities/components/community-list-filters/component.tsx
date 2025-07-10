import * as React from 'react';
import { View } from 'react-native';

import CommunityListFilterButton from './community-list-filter-button';
import { styles } from './styles';
import { CommunityListFilterProps } from './types';

import { I18n } from '~/app/i18n';
import SegmentedControl from '~/framework/components/buttons/segmented-control';

const CommunityListFilters: React.FC<CommunityListFilterProps> = ({
  onTogglePending,
  pendingInvitationsCount,
  showPendingOnly,
}) => {
  return (
    <View style={styles.filterBar}>
      {pendingInvitationsCount && pendingInvitationsCount > 0 ? (
        <SegmentedControl
          isActive={showPendingOnly}
          numberOfFilteredItems={pendingInvitationsCount}
          onPress={onTogglePending}
          text={I18n.get('communities-pending-invitations')}
        />
      ) : (
        <View style={styles.reservedSpace} /> // keep space when SegmentedControl isn't rendered
      )}
      <CommunityListFilterButton />
    </View>
  );
};

export default CommunityListFilters;
