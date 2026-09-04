import type { SvgIconName } from '~/framework/components/picture';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import type { CarnetDeBordSection, ICarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';
import type { CarnetDeBordSectionColors } from '~/framework/modules/widgets/carnet-de-board/model/sections';

export interface CarnetDeBordSectionCardProps {
  colors: CarnetDeBordSectionColors;
  icon: SvgIconName;
  title: string;
  // the one line the block shows, replaced by `emptyText` when there is nothing to show.
  value?: string;
  emptyText: string;
  section: CarnetDeBordSection;
  onPress: (section: CarnetDeBordSection) => void;
}

export interface CarnetDeBordWidgetPlaceholderProps {
  tabs: boolean;
}

export interface CarnetDeBordWidgetProps {
  session: AuthActiveAccount;
  onOpen: () => void;
  onOpenSection: (section: CarnetDeBordSection, data: ICarnetDeBord) => void;
}
