import type { AnimationObject } from 'lottie-react-native';

import type { SvgIconName } from '~/framework/components/picture';

type Illustration = { type: 'svg'; name: SvgIconName } | { type: 'animated'; source: AnimationObject };

/** A slide of the onboarding. */
export interface OnboardingSlide {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  illustration: Illustration;
}
