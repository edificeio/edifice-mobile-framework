/* eslint-disable react-native/no-raw-text */
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { MailsContactItemProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
import { MailsVisibleType } from '~/framework/modules/mails/model';
import { accountTypeInfos } from '~/framework/util/accountType';

export const MailsContactItem = (props: MailsContactItemProps) => {
  const { displayName, id, profile } = props.user;

  const onDelete = React.useCallback(() => {
    props.onDelete(props.user);
  }, [props]);

  const renderAccountType = React.useCallback(() => {
    if (props.user.type !== MailsVisibleType.USER) return null;
    return (
      <>
        {' - '}
        <SmallBoldText style={{ color: accountTypeInfos[profile!].color.regular }}>{accountTypeInfos[profile!].text}</SmallBoldText>
      </>
    );
  }, [profile, props.user.type]);

  const renderCloseIcon = React.useCallback(() => {
    if (!props.isEditing) return null;
    return (
      <TouchableOpacity onPress={onDelete}>
        <Svg
          name="ui-close"
          fill={theme.palette.grey.black}
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
        />
      </TouchableOpacity>
    );
  }, [onDelete, props.isEditing]);

  return (
    <View style={styles.container}>
      <MailsRecipientAvatar size="sm" id={id} type={props.user.type} />
      <SmallText style={styles.text} numberOfLines={1}>
        <SmallBoldText>{displayName}</SmallBoldText>
        {renderAccountType()}
      </SmallText>
      {renderCloseIcon()}
    </View>
  );
};
