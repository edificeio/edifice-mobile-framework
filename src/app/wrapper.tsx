import React from 'react';
import { Text, View } from 'react-native';

import { CoreModule, EntModule } from './module';
import { useModulesOfType } from './module/loader';

export function AppWrapper() {
  const coreModules = useModulesOfType(CoreModule);
  const entModules = useModulesOfType(EntModule);
  return (
    <View>
      <Text>CORE MODULES ---</Text>
      {coreModules.map(m => (
        <Text key={m.name}>{m.name}</Text>
      ))}
      <Text>ENT MODULES ---</Text>
      {entModules.map(m => (
        <Text key={m.name}>
          {m.name} - {m.entTrackingName}
        </Text>
      ))}
    </View>
  );
}
