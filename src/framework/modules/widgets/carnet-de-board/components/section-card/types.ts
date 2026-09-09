import type { CarnetDeBordScreenSectionLabels, CarnetDeBordSection } from '~/framework/modules/widgets/carnet-de-board/model';

export interface CarnetDeBordSectionCardProps {
  emptyText: string;
  labels?: CarnetDeBordScreenSectionLabels;
  onPress: (section: CarnetDeBordSection) => void;
  section: CarnetDeBordSection;
  title: string;
}
