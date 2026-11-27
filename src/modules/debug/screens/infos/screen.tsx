import * as React from 'react';
import { View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import { SmallBoldText } from '~/framework/components/text';
import { fullVersionLabel, versionDetails } from '~/framework/util/app-info';
import { useSession } from '~/modules/auth/store/accounts';

import styles from './styles';

// No `withSession`: this screen is opened before sign-in too (platform list), where there is no session.
export function InfosScreen({}: StaticScreenProps<undefined>) {
  const session = useSession();
  return (
    <View style={styles.page}>
      <SmallBoldText style={styles.version}>{`Version : ${fullVersionLabel}`}</SmallBoldText>
      <SmallBoldText style={styles.version}>
        {`Platform : ${session?.platform?.displayName ?? session?.platform?.name}`}
      </SmallBoldText>
      <SmallBoldText style={styles.version}>{`Override : ${versionDetails.override}`}</SmallBoldText>
      <SmallBoldText
        style={
          styles.version
        }>{`Device : ${versionDetails.deviceModel} - ${versionDetails.os} ${versionDetails.osVersion}`}</SmallBoldText>
    </View>
  );
}

export default defineModal({
  options: () => ({ presentation: 'fullScreenModal', title: 'App Infos' }),
  screen: InfosScreen,
});
