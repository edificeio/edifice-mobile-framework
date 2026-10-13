import type { Svg } from '~/framework/components/picture';

/**
 * An introduction page: a picture, a title, a description and a button that goes on. The template does not know what it
 * introduces nor where the button leads: the caller gives the texts and the action (no default text).
 */
export interface SignInIntroductionScreenTemplateProps {
  /** Name of the picture shown above the title (see `Svg`). */
  svgName: React.ComponentProps<typeof Svg>['name'];
  title: string;
  description: string;
  buttonText: string;
  /** The user pressed the button. */
  onContinue: () => void;
}
