import type { AllModulesNames } from '~/app/module';
import type { EntAppImageProps } from '~/framework/components/picture/ent-app-image/types';

export type ModuleImageProps = Omit<EntAppImageProps, 'entAppName'> & {
  /** The module whose app gives the colors and the icon when there is no image. */
  moduleName: AllModulesNames;
};
