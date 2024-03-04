import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatListProps, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { getScaleWidth } from '~/framework/components/constants';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import HandleAccountList from '~/framework/modules/auth/components/handle-account-list';
import { LargeHorizontalUserList } from '~/framework/modules/auth/components/large-horizontal-user-list';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import styles from '~/framework/modules/auth/screens/main-account/account-selection/styles';
import {
  AuthAccountSelectionScreenDispatchProps,
  AuthAccountSelectionScreenPrivateProps,
} from '~/framework/modules/auth/screens/main-account/account-selection/types';
import { navBarOptions } from '~/framework/navigation/navBar';
import appConf from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';
import { tryAction } from '~/framework/util/redux/actions';
import { trackingActionAddSuffix } from '~/framework/util/tracker';

import { restoreAction } from '../../../actions';
import { AuthSavedAccountWithTokens, accountIsLoggable } from '../../../model';
import moduleConfig from '../../../module-config';
import { getLoginNextScreen } from '../../../navigation/main-account/router';
import { getState as getAuthState } from '../../../reducer';

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
  const { navigation, accounts, tryRestore } = props;
  const accountListRef = React.useRef<BottomSheetModalMethods>(null);
  const onHandleAccounts = () => {
    accountListRef.current?.present();
  };
  const data = React.useMemo(() => Object.values(props.accounts), [props.accounts]);
  const dataforList = React.useMemo(
    () =>
      data.map(account => ({
        id: account.user.id,
        type: account.user.type,
        displayName: account.user.displayName,
        avatarCache: account.user.avatarCache,
        platform: appConf.getExpandedPlatform(account.platform),
        login: account.user.loginUsed,
        isLoggable: accountIsLoggable(account),
      })),
    [data],
  );

  const onItemPress = React.useCallback(
    async (item: (typeof dataforList)[0], index: number) => {
      const redirect = (i: typeof item) => {
        if (!i.platform) {
          console.warn('AccountSelectionScreen: Missing platform for this account');
          toast.showError(I18n.get('auth-account-select-error'));
          return;
        }
        const nextScreen = getLoginNextScreen(i.platform);
        if (!nextScreen) {
          console.warn('AccountSelectionScreen: Next screen cannot be determined for this user');
          toast.showError(I18n.get('auth-account-select-error'));
          return;
        }
        navigation.navigate({ ...nextScreen, params: { ...nextScreen.params, accountId: item.id } });
      };
      if (item.isLoggable) {
        try {
          const account = accounts[item.id];
          await tryRestore(account as AuthSavedAccountWithTokens);
        } catch (e) {
          console.warn(e);
          redirect(item);
        }
      } else {
        redirect(item);
      }
    },
    [accounts, navigation, tryRestore],
  );

  const keyExtractor: FlatListProps<(typeof dataforList)[0]>['keyExtractor'] = React.useCallback(
    (item: (typeof dataforList)[0]) => item.id,
    [],
  );

  return (
    <PageView style={styles.page}>
      <View style={styles.topContainer}>
        <NamedSVG name="multi-account" width={getScaleWidth(130)} height={getScaleWidth(130)} />
        <View style={styles.textContainer}>
          <HeadingXSText>{I18n.get('auth-accountselection-heading')}</HeadingXSText>
          <SmallText style={styles.description}>{I18n.get('auth-accountselection-description')}</SmallText>
        </View>
        <LargeHorizontalUserList keyExtractor={keyExtractor} data={dataforList} onItemPress={onItemPress} />
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

export default connect(
  state => ({
    accounts: getAuthState(state).accounts,
  }),
  dispatch =>
    bindActionCreators<AuthAccountSelectionScreenDispatchProps>(
      {
        tryRestore: tryAction(restoreAction, {
          track: res => [
            moduleConfig,
            trackingActionAddSuffix('Login restore', !(res instanceof global.Error)),
            res instanceof global.Error ? Error.getDeepErrorType(res)?.toString() ?? res.toString() : undefined,
          ],
        }),
      },
      dispatch,
    ),
)(AccountSelectionScreen);
