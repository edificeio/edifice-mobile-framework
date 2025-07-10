export interface CommunityListFilterProps {
  activeFiltersCount: number;
  isShowingPending: boolean;
  onFiltersButtonPress?: () => void;
  onPendingPress?: (index: number | undefined) => void;
  pendingInvitationsCount?: number;
}
