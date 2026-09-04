import type { CarnetDeBordSection } from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';
import type { CarnetDeBordScreenSectionLabels } from '~/framework/modules/widgets/carnet-de-board/model/screen-sections';

export interface CarnetDeBordSectionCardProps {
  emptyText: string;
  labels?: CarnetDeBordScreenSectionLabels;
  onPress: (section: CarnetDeBordSection) => void;
  section: CarnetDeBordSection;
  title: string;
}
