import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, View } from 'react-native';

import { I18n } from '~/app/i18n';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { getScaleWidth } from '~/framework/components/constants';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import HandleAccountList from '~/framework/modules/auth/components/handle-account-list';
import { LargeHorizontalUserList } from '~/framework/modules/auth/components/large-horizontal-user-list';
import { AccountType } from '~/framework/modules/auth/model';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import styles from '~/framework/modules/auth/screens/main-account/account-selection/styles';
import { AuthAccountSelectionScreenPrivateProps } from '~/framework/modules/auth/screens/main-account/account-selection/types';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.accountSelection>): NativeStackNavigationOptions => {
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
      id: '0afae690-7a12-4419-bbb5-ae6ebaed4fe0',
      displayName: 'Ablusse Dumby',
      type: AccountType.Teacher,
      selected: true,
    },
    {
      id: '9f09224b-a0b4-427b-a311-60600d520364',
      displayName: 'Ron Ron Ron WIIIISELEY Super Plus Ultra Madafaka',
      type: AccountType.Student,
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
        <LargeHorizontalUserList
          keyExtractor={item => item.id}
          data={data}
          onItemPress={(item, index) => {
            Alert.alert('pressed ' + item.displayName + ' ' + index + ' ' + item.type.toString());
          }}
        />
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
