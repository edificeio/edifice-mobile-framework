import * as React from 'react';
import { FlatListProps, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { getScaleWidth } from '~/framework/components/constants';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import { HeadingXSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { accountIsLoggable, AuthSavedLoggedInAccountWithCredentials } from '~/modules/auth/model';
import { LargeHorizontalUserList } from '~/modules/auth/sign-in/components/large-horizontal-user-list';
import ManageAccountsBottomSheet from '~/modules/auth/sign-in/components/manage-accounts-bottom-sheet';
import { Loading } from '~/ui/Loading';
import { I18n } from '~/util/i18n';

import styles from './styles';
import type { AccountsScreenTemplateProps } from './types';

export const AccountsScreenTemplate = React.memo(function ({
  accounts,
  loading,
  onAddAccount,
  onDeleteAccount,
  onOpenManageAccounts,
  onSelectAccount,
}: AccountsScreenTemplateProps) {
  const manageAccountsRef = React.useRef<BottomSheetModalMethods>(null);

  const openManageAccounts = React.useCallback(() => {
    onOpenManageAccounts?.();
    manageAccountsRef.current?.present();
  }, [onOpenManageAccounts]);

  const deleteAccount = React.useCallback(
    async (account: (typeof accounts)[0]) => {
      try {
        await onDeleteAccount?.(account);
        manageAccountsRef.current?.dismiss();
      } catch (e) {
        console.error(e);
      }
    },
    [onDeleteAccount],
  );

  const items = React.useMemo(
    () =>
      accounts.map(account => ({
        displayName: account.user.displayName,
        id: account.user.id,
        isLoggable: accountIsLoggable(account),
        login: (account.user as Partial<AuthSavedLoggedInAccountWithCredentials['user']>).loginUsed,
        method: account.method,
        platform: typeof account.platform === 'string' ? account.platform : account.platform.name,
        type: account.user.type,
      })),
    [accounts],
  );

  const selectAccount = React.useCallback(
    (item: (typeof items)[0]) => {
      const account = accounts.find(a => a.user.id === item.id);
      if (account) return onSelectAccount(account);
    },
    [accounts, onSelectAccount],
  );

  const keyExtractor: FlatListProps<(typeof items)[0]>['keyExtractor'] = React.useCallback(
    (item: (typeof items)[0]) => item.id,
    [],
  );

  return (
    <View style={styles.page}>
      <View style={styles.topContainer}>
        <Svg name="multi-account" width={getScaleWidth(130)} height={getScaleWidth(130)} />
        <View style={styles.textContainer}>
          <HeadingXSText>{I18n.get('auth-accountselection-heading')}</HeadingXSText>
          <SmallText style={styles.description}>{I18n.get('auth-accountselection-description')}</SmallText>
        </View>
        <LargeHorizontalUserList
          keyExtractor={keyExtractor}
          data={items}
          onItemPress={selectAccount}
          ListFooterComponent={
            onAddAccount ? (
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
      {loading ? <Loading /> : null}
      {onDeleteAccount ? (
        <View style={styles.bottomContainer}>
          <SecondaryButton
            style={styles.button}
            text={I18n.get('auth-accountselection-button')}
            iconLeft="ui-settings"
            action={openManageAccounts}
          />
          <ManageAccountsBottomSheet ref={manageAccountsRef} data={accounts} onDelete={deleteAccount} />
        </View>
      ) : null}
    </View>
  );
});
AccountsScreenTemplate.displayName = 'AccountsScreenTemplate';
