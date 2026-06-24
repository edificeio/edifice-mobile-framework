import { SvgIconName } from '~/framework/components/picture';

export interface ActionCardProps {
  actionIcon: SvgIconName;
  actionText: string;
  description: string;
  picture: SvgIconName;
  testId: string;
  title: string;
  onAction: () => void;
}
