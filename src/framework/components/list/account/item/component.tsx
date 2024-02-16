import * as React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import styles from '~/framework/components/list/account/item/styles';
import { AccountListItemProps } from '~/framework/components/list/account/item/types';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import Avatar, { Size } from '~/ui/avatars/Avatar';

const AccountListItem = ({ id, displayName, type, selected }: AccountListItemProps) => {
  const containerBackgroundColor = { backgroundColor: selected ? theme.palette.primary.pale : theme.ui.background.card };
  const typeColor = { color: theme.color.profileTypes[type] };
  const typeText = I18n.get(`user-profiletypes-${type}`.toLowerCase());
  const numberOfLines = 1;
  const onSelectAccount = () => id;
  const onRemoveAccount = () => {
    Alert.alert(I18n.get('accountlistitem-removealert-title'), I18n.get('accountlistitem-removealert-description'), [
      {
        text: I18n.get('common-delete'),
        style: 'destructive',
        onPress: () => id,
      },
      {
        text: I18n.get('common-cancel'),
      },
    ]);
  };

  return (
    <TouchableOpacity style={[styles.container, containerBackgroundColor]} onPress={onSelectAccount}>
      <View>
        <Avatar size={Size.large} id={id} />
        <View style={styles.avatarContour} />
      </View>
      <View style={styles.textContainer}>
        <SmallText numberOfLines={numberOfLines}>{displayName}</SmallText>
        <SmallBoldText numberOfLines={numberOfLines} style={typeColor}>
          {typeText}
        </SmallBoldText>
      </View>
      <IconButton
        style={styles.iconButton}
        color={theme.palette.complementary.red.regular}
        icon="ui-delete"
        action={onRemoveAccount}
      />
    </TouchableOpacity>
  );
};

export default AccountListItem;
