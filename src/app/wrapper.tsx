import React from 'react';
import { Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { BodyBoldText } from '~/framework/components/text';
import { I18n } from '~/util/i18n';

import { CoreModule, EntModule } from './module';
import { useModulesOfType } from './module/loader';

export function AppWrapper() {
  const coreModules = useModulesOfType(CoreModule);
  const entModules = useModulesOfType(EntModule);
  const state = useSelector(s => s);
  return (
    <SafeAreaView style={{ backgroundColor: 'white' }}>
      <BodyBoldText>CORE MODULES ---</BodyBoldText>
      {coreModules.map(m => (
        <Text key={m.name}>{m.name}</Text>
      ))}
      <BodyBoldText>ENT MODULES ---</BodyBoldText>
      {entModules.map(m => (
        <Text key={m.name}>
          {m.name} - {m.entTrackingName}
        </Text>
      ))}
      <BodyBoldText>STORE REDUX ---</BodyBoldText>
      <Text>{JSON.stringify(state)}</Text>
      <BodyBoldText>TEST I18N ---</BodyBoldText>
      <Text>{I18n.get('media-download-inprogress')}</Text>
    </SafeAreaView>
  );
}
