import * as React from 'react';
import { View } from 'react-native';

import { HeaderButton } from '@react-navigation/elements';

import { SelfAvatar } from '~/framework/components/avatar/self';

import styles from './styles';
import { NavBarProfileButtonProps } from './types';

const DEFAULT_TEST_ID = 'timeline-profile-button';

export function NavBarProfileButton({ onPress, testID = DEFAULT_TEST_ID }: NavBarProfileButtonProps) {
  return (
    <HeaderButton style={styles.button} testID={testID} onPress={onPress} pressColor="transparent">
      <View style={styles.avatar}>
        <SelfAvatar size="sm" />
      </View>
    </HeaderButton>
  );
}
