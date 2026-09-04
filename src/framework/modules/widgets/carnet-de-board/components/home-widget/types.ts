import type { SvgIconName } from '~/framework/components/picture';
import type { BLOCK_COLORS } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/constants';
import type { CarnetDeBordSection, ICarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';
import { ValueOf } from '~/utils/types';

export type CarnetDeBordSectionColors = ValueOf<typeof BLOCK_COLORS>;

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

export interface CarnetDeBordWidgetProps {
  onOpen: () => void;
  onOpenSection: (section: CarnetDeBordSection, data: ICarnetDeBord) => void;
}
