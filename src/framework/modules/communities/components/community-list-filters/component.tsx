import * as React from 'react';
import { View } from 'react-native';

import CommunityListFilterButton from './community-list-filter-button';
import { styles } from './styles';
import { CommunityListFilterProps } from './types';

import { I18n } from '~/app/i18n';
import SegmentedControl from '~/framework/components/segmented-control';

const CommunityListFilters = ({
  activeFiltersCount,
  isShowingPending,
  onFiltersButtonPress,
  onPendingPress,
  pendingInvitationsCount,
}: Readonly<CommunityListFilterProps>) => {
  const segment = React.useMemo(
    () => [{ count: pendingInvitationsCount, id: '0', text: I18n.get('communities-pending-invitations') }],
    [pendingInvitationsCount],
  );

  return (
    <View style={styles.filterBar}>
      <SegmentedControl
        canUnselect={true}
        initialSelectedIndex={isShowingPending ? 0 : undefined}
        segments={segment}
        onChange={onPendingPress}
      />
      <CommunityListFilterButton activeFiltersCount={activeFiltersCount} onPress={onFiltersButtonPress} />
    </View>
  );
};

export default CommunityListFilters;
