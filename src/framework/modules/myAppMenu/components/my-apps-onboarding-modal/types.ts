type Illustration = { type: 'svg'; name: string } | { type: 'animated'; source: any };
export type MAOSProps = {
  key: string;
  title: string;
  description: string;
  illustration: Illustration;
  isActive?: boolean;
};

export type MyAppsOnboardingModalProps = {
  slides: MAOSProps[];
  onDismiss: () => void;
  onComplete: () => void;
};
