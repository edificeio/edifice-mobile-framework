import React from 'react';
import { FlatListProps, TouchableOpacity, View } from 'react-native';

import { CommonActions, StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import theme from '~/app/theme';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { getScaleWidth } from '~/framework/components/constants';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import { HeadingXSText, SmallBoldText, SmallText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { removeAccount, restoreAccount } from '~/modules/auth/flows';
import { withTracking } from '~/modules/auth/flows/track';
import {
  accountIsLoggable,
  AuthActiveAccount,
  AuthSavedLoggedInAccount,
  AuthSavedLoggedInAccountWithCredentials,
  getOrderedAccounts,
} from '~/modules/auth/model';
import HandleAccountList from '~/modules/auth/sign-in/components/handle-account-list';
import { LargeHorizontalUserList } from '~/modules/auth/sign-in/components/large-horizontal-user-list';
import { getRouteForAccountLoad, useSignInNavigation } from '~/modules/auth/sign-in/navigation';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import track, { trackingAccountEvents } from '~/modules/auth/tracking';
import { Loading } from '~/ui/Loading';
import { I18n } from '~/util/i18n';

import styles from './styles';
import { LoginState } from './types';

const SignInAccountsScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigation = useSignInNavigation();
  const accounts = useAccountsStore(s => s.accounts);
  const [loadingState, setLoadingState] = React.useState<LoginState>(LoginState.IDLE);
  const accountListRef = React.useRef<BottomSheetModalMethods>(null);
  const onHandleAccounts = () => {
    trackingAccountEvents.manageAccountsPressButton();
    accountListRef.current?.present();
  };
  const data = React.useMemo(() => getOrderedAccounts(accounts), [accounts]);
  const dataforList = React.useMemo(
    () =>
      data.map(account => ({
        displayName: account.user.displayName,
        id: account.user.id,
        isLoggable: accountIsLoggable(account),
        login: (account.user as Partial<AuthSavedLoggedInAccountWithCredentials['user']>).loginUsed,
        method: account.method,
        platform: typeof account.platform === 'string' ? account.platform : account.platform.name,
        type: account.user.type,
      })),
    [data],
  );

  const onItemPress = React.useCallback(
    async (item: (typeof dataforList)[0]) => {
      const redirect = (i: typeof item) => {
        const route = getRouteForAccountLoad(i);
        if (!route) {
          console.warn('AccountSelectionScreen: Missing platform for this account');
          toast.showError(I18n.get('auth-account-select-error'));
          return;
        }
        navigation.navigate(route);
      };
      if (loadingState !== LoginState.IDLE) return;
      if (item.isLoggable) {
        try {
          setLoadingState(LoginState.RUNNING);
          const account = accounts[item.id];
          await withTracking(track.loginRestore, () => restoreAccount(account as AuthSavedLoggedInAccount | AuthActiveAccount));
          setLoadingState(LoginState.DONE);
        } catch (e) {
          setLoadingState(LoginState.IDLE);
          console.error(e);
          // On failure, `restoreAccount` sets the sign-in status & error, so the navigator puts the login screen of the account
          // on top of this screen by itself (the error is displayed there). Navigating manually would duplicate it.
        }
      } else {
        redirect(item);
      }
    },
    [accounts, loadingState, navigation],
  );

  const onDeleteItem = React.useCallback(
    async (item: (typeof data)[0]) => {
      try {
        trackingAccountEvents.deleteAccountFromManageAccounts();
        const account = accounts[item.user.id];
        await removeAccount(account);
        accountListRef.current?.dismiss();
        toast.showSuccess(I18n.get('auth-accountlist-delete-success'));
      } catch (e) {
        console.error(e);
      }
    },
    [accounts],
  );

  // The sign-in navigator doesn't know this route: the action is forwarded to the parent navigation.
  const onAddAccount = React.useCallback(
    async () => navigation.dispatch(CommonActions.navigate({ name: 'auth/add-account' })),
    [navigation],
  );

  const keyExtractor: FlatListProps<(typeof dataforList)[0]>['keyExtractor'] = React.useCallback(
    (item: (typeof dataforList)[0]) => item.id,
    [],
  );

  return (
    <PageView style={styles.page}>
      <View style={styles.topContainer}>
        <Svg name="multi-account" width={getScaleWidth(130)} height={getScaleWidth(130)} />
        <View style={styles.textContainer}>
          <HeadingXSText>{I18n.get('auth-accountselection-heading')}</HeadingXSText>
          <SmallText style={styles.description}>{I18n.get('auth-accountselection-description')}</SmallText>
        </View>
        <LargeHorizontalUserList
          keyExtractor={keyExtractor}
          data={dataforList}
          onItemPress={onItemPress}
          ListFooterComponent={
            data.length === 1 ? (
              <TouchableOpacity onPress={onAddAccount} style={styles.addAccount}>
                <View style={styles.addAccountRound}>
                  <Svg name="ui-plus" fill={theme.palette.primary.regular} height={getScaleWidth(48)} width={getScaleWidth(48)} />
                </View>
                <SmallBoldText style={styles.addAccountText}>{I18n.get('auth-accountbutton-add')}</SmallBoldText>
              </TouchableOpacity>
            ) : undefined
          }
        />
      </View>
      {loadingState !== LoginState.IDLE ? <Loading /> : null}
      <View style={styles.bottomContainer}>
        <SecondaryButton
          style={styles.button}
          text={I18n.get('auth-accountselection-button')}
          iconLeft="ui-settings"
          action={onHandleAccounts}
        />
        <HandleAccountList ref={accountListRef} data={data} onDelete={onDeleteItem} />
      </View>
    </PageView>
  );
});
SignInAccountsScreen.displayName = 'SignInAccountsScreen';

export default defineScreen({ options: { title: I18n.get('auth-accountselection-title') }, screen: SignInAccountsScreen });
