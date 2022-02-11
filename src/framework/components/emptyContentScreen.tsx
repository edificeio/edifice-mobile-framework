import * as React from 'react';
import { View } from 'react-native';
import I18n from 'i18n-js';

import EmptyContent from 'ode-images/empty-screen/empty-content.svg';
import { Text, TextBold } from './text';
import theme from '~/app/theme';

export const EmptyContentScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.neutral.extraLight, alignItems: 'center', justifyContent: 'center' }}>
      <EmptyContent style={{ aspectRatio: 1, maxHeight: '40%', maxWidth: '70%', marginBottom: 30, marginTop: '10%' }} />
      <TextBold style={{ fontSize: 18, marginBottom: 20, color: theme.color.secondary.regular }}>
        {I18n.t('common.error.title')}
      </TextBold>
      <Text style={{ textAlign: 'center' }}>{I18n.t('common.error.content.text')}</Text>
    </View>
  );
};
