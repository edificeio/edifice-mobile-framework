import React from 'react';
import { View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';

import { sheetSpacingStyles, useFormSheetStyleFix } from '~/app/navigation-new/layout';
import toast from '~/framework/components/toast';
import { AccountList } from '~/modules/auth/components';
import { useAuthFlows } from '~/modules/auth/flows';
import { type AuthActiveAccount, type AuthSavedAccount, getOrderedAccounts } from '~/modules/auth/model';
import { getActiveAccount, useAccountsStore } from '~/modules/auth/store/accounts';
import { I18n } from '~/util/i18n';

import type { AccountListSheetScreenTemplateProps } from './types';

export const AccountListSheetScreenTemplate = ({ description, onDelete, onPress, title }: AccountListSheetScreenTemplateProps) => {
  const navigation = useNavigation();
  const { removeAccount } = useAuthFlows();
  const accounts = useAccountsStore(s => s.accounts);
  const data = React.useMemo(() => getOrderedAccounts(accounts), [accounts]);
  const formSheetStyle = useFormSheetStyleFix();

  // With less than two accounts there is nothing to choose from.
  const noChoice = data.length < 2;
  React.useEffect(() => {
    if (noChoice && navigation.canGoBack()) navigation.goBack();
  }, [navigation, noChoice]);

  const handleDelete = React.useCallback(
    async (account: AuthSavedAccount | AuthActiveAccount) => {
      try {
        await onDelete?.(account);
        const wasActive = getActiveAccount()?.user.id === account.user.id;
        await removeAccount(account);
        // Removing the connected account logs it out: the user is sent to the sign-in screens, no toast then.
        if (!wasActive) toast.showSuccess(I18n.get('auth-accountlist-delete-success'));
      } catch (e) {
        console.error(e);
      }
    },
    [onDelete, removeAccount],
  );

  return (
    <View style={formSheetStyle}>
      <AccountList
        ListComponent={FlatList}
        accounts={data}
        contentContainerStyle={sheetSpacingStyles.padding}
        description={description}
        onDelete={onDelete && handleDelete}
        onPress={onPress}
        title={title}
      />
    </View>
  );
};
