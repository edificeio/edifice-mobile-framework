import * as React from 'react';
import { View } from 'react-native';

import CommunityListFilterButton from './community-list-filter-button';
import { styles } from './styles';
import { CommunityListFilterProps } from './types';

import { I18n } from '~/app/i18n';
import SegmentedControl from '~/framework/components/buttons/segmented-control';

const CommunityListFilters = ({
  activeFiltersCount,
  isShowingPending,
  onFiltersButtonPress,
  onPendingPress,
  pendingInvitationsCount,
}: Readonly<CommunityListFilterProps>) => {
  const canShowPendingFilter = pendingInvitationsCount && pendingInvitationsCount > 0;
  const segment = React.useMemo(() => {
    return pendingInvitationsCount
      ? [{ count: pendingInvitationsCount, id: '0', text: I18n.get('communities-pending-invitations') }]
      : [];
  }, [pendingInvitationsCount]);

  return (
    <View style={styles.filterBar}>
      {canShowPendingFilter ? (
        <SegmentedControl
          canUnselect={true}
          initialSelectedIndex={isShowingPending ? 0 : undefined}
          segments={segment}
          onChange={onPendingPress}
        />
      ) : (
        <View />
      )}
      <CommunityListFilterButton activeFiltersCount={activeFiltersCount} onPress={onFiltersButtonPress} />
    </View>
  );
};

export default CommunityListFilters;
