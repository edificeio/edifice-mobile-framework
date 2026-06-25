import { SvgIconName } from '~/framework/components/picture';

type Illustration = { type: 'svg'; name: SvgIconName } | { type: 'animated'; source: any };
export type MAOSProps = {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  illustration: Illustration;
  isActive?: boolean;
};

export type MyAppsOnboardingModalProps = {
  slides: MAOSProps[];
  onDismiss?: () => void;
  onComplete: () => void;
};
