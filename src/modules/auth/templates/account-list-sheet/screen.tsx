import React from 'react';
import { View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';

import { sheetSpacingStyles, useFormSheetStyleFix } from '~/app/navigation-new/layout';
import { AccountList } from '~/modules/auth/components';
import { getOrderedAccounts } from '~/modules/auth/model';
import { useAccountsStore } from '~/modules/auth/store/accounts';

import type { AccountListSheetScreenTemplateProps } from './types';

export const AccountListSheetScreenTemplate = ({ description, onDelete, onPress, title }: AccountListSheetScreenTemplateProps) => {
  const navigation = useNavigation();
  const accounts = useAccountsStore(s => s.accounts);
  const data = React.useMemo(() => getOrderedAccounts(accounts), [accounts]);
  const formSheetStyle = useFormSheetStyleFix();

  // With less than two accounts there is nothing to choose from.
  const noChoice = data.length < 2;
  React.useEffect(() => {
    if (noChoice && navigation.canGoBack()) navigation.goBack();
  }, [navigation, noChoice]);

  return (
    <View style={formSheetStyle}>
      <AccountList
        ListComponent={FlatList}
        accounts={data}
        contentContainerStyle={sheetSpacingStyles.padding}
        description={description}
        onDelete={onDelete}
        onPress={onPress}
        title={title}
      />
    </View>
  );
};
