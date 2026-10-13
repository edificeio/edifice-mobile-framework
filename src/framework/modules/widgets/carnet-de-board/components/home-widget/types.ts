import type { SvgIconName } from '~/framework/components/picture';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import type { CarnetDeBordSection, CarnetDeBordSectionColors } from '~/framework/modules/widgets/carnet-de-board/model';

export interface CarnetDeBordWidgetSectionCardProps {
  colors: CarnetDeBordSectionColors;
  icon: SvgIconName;
  title: string;
  // the one line the block shows, replaced by `emptyText` when there is nothing to show.
  value?: string;
  emptyText: string;
  section: CarnetDeBordSection;
  onPress: (section: CarnetDeBordSection) => void;
}

export interface CarnetDeBordWidgetProps {
  session: AuthActiveAccount;
}
