import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { getScaleWidth } from '~/framework/components/constants';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import HandleAccountList from '~/framework/modules/auth/components/handle-account-list';
import { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import styles from '~/framework/modules/auth/screens/account-selection/styles';
import { AuthAccountSelectionScreenPrivateProps } from '~/framework/modules/auth/screens/account-selection/types';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.accountSelection>): NativeStackNavigationOptions => {
  return {
    ...navBarOptions({
      navigation,
      route,
      title: I18n.get('auth-accountselection-title'),
    }),
  };
};

const AccountSelectionScreen = (props: AuthAccountSelectionScreenPrivateProps) => {
  const accountListRef = React.useRef<BottomSheetModalMethods>(null);
  const onHandleAccounts = () => {
    accountListRef.current?.present();
  };
  const data = [
    {
      avatar: new Blob(),
      id: '111',
      name: 'FirstName LastName',
      type: 'Personnel',
      selected: true,
    },
    {
      avatar: new Blob(),
      id: '123',
      name: 'Secondary Account',
      type: 'Teacher',
      selected: false,
    },
  ];

  return (
    <PageView style={styles.page}>
      <View style={styles.topContainer}>
        <NamedSVG name="multi-account" width={getScaleWidth(130)} height={getScaleWidth(130)} />
        <View style={styles.textContainer}>
          <HeadingXSText>{I18n.get('auth-accountselection-heading')}</HeadingXSText>
          <SmallText style={styles.description}>{I18n.get('auth-accountselection-description')}</SmallText>
        </View>
        <View style={{ borderWidth: 0.5, width: '100%', height: 160, justifyContent: 'center', alignItems: 'center' }}>
          <HeadingXSText>UserList</HeadingXSText>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <SecondaryButton
          style={styles.button}
          text={I18n.get('auth-accountselection-button')}
          iconLeft="ui-settings"
          action={onHandleAccounts}
        />
        <HandleAccountList ref={accountListRef} data={data} />
      </View>
    </PageView>
  );
};

export default AccountSelectionScreen;
