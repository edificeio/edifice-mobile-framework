export interface CommunityListFilterProps {
  numberActiveFilters?: number;
  onTogglePending?: () => void;
  pendingInvitationsCount?: number;
  showPendingOnly?: boolean;
}
