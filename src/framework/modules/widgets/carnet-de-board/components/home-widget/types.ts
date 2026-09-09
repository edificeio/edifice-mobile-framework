import type { SvgIconName } from '~/framework/components/picture';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import type {
  CarnetDeBordSection,
  CarnetDeBordSectionColors,
  ICarnetDeBord,
} from '~/framework/modules/widgets/carnet-de-board/model';

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
  loading: boolean;
  onOpen: () => void;
  onOpenSection: (section: CarnetDeBordSection, data: ICarnetDeBord) => void;
}
