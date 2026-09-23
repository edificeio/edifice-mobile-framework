import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import type { CarnetDeBordSection, ICarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/model';

export interface WidgetsSectionProps {
  carnetDeBordLoading: boolean;
  onOpenCarnetDeBord: () => void;
  onOpenCarnetDeBordSection: (section: CarnetDeBordSection, data: ICarnetDeBord) => void;
  session: AuthActiveAccount;
}
