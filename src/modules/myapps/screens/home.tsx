import React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { UI_STYLES } from '~/framework/components/constants';

export default function MyAppsHomeScreen({}: StaticScreenProps<undefined>) {
  return <View style={UI_STYLES.flex1} />;
}
