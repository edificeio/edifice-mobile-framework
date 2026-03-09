/* eslint-disable react-native/no-raw-text */
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { MailsContactItemProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';
import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
import { MailsVisibleType } from '~/framework/modules/mails/model';
import { getExternalInitials } from '~/framework/modules/mails/util';
import { accountTypeInfos } from '~/framework/util/accountType';

export const MailsContactItem = (props: MailsContactItemProps) => {
  const { displayName, id, profile } = props.user;
  const isExternal = profile === AccountType.External;

  const onDelete = React.useCallback(() => {
    props.onDelete(props.user);
  }, [props]);

  const renderAvatar = React.useCallback(() => {
    if (props.user.type === MailsVisibleType.EXTERNAL) {
      const initials = getExternalInitials(displayName);
      return (
        <View style={styles.avatar}>
          <SmallBoldText style={styles.avatarText}>{initials}</SmallBoldText>
        </View>
      );
    }
    return <MailsRecipientAvatar size="sm" id={id} type={props.user.type} />;
  }, [displayName, id, props.user.type]);

  const renderAccountType = React.useCallback(() => {
    if (props.user.type !== MailsVisibleType.USER) return null;
    if (!profile) return null;
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
      {renderAvatar()}
      <View style={styles.textContainer}>
        <SmallText style={styles.text} numberOfLines={props.user.type === MailsVisibleType.EXTERNAL ? undefined : 1}>
          <SmallBoldText>{displayName}</SmallBoldText>
          {isExternal ? <SmallText style={styles.idText}> - {id}</SmallText> : renderAccountType()}
        </SmallText>
      </View>
      {renderCloseIcon()}
    </View>
  );
};
