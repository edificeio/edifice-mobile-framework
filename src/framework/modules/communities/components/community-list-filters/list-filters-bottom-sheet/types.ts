import { CommunityType } from '@edifice.io/community-client-rest-rn';

export interface ListFiltersBottomSheetProps {
  onValidate: (newFilters: CommunityType[]) => void;
  selectedFilters: CommunityType[];
}
