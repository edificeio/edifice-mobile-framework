import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  fetchInfo(): { [key: string]: string };
}

export default TurboModuleRegistry.getEnforcing<Spec>('BuildInfo');
