import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { MailsContactItemProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { AvatarSize } from '~/framework/components/newavatar';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
import { MailsVisibleType } from '~/framework/modules/mails/model';
import { accountTypeInfos } from '~/framework/util/accountType';

export const MailsContactItem = (props: MailsContactItemProps) => {
  const { id, displayName, profile } = props.user;
  const onDelete = () => {
    props.onDelete(props.user);
  };

  return (
    <View style={styles.container}>
      <MailsRecipientAvatar size={AvatarSize.sm} id={id} type={props.user.type} />
      <SmallText style={styles.text} numberOfLines={1}>
        <SmallBoldText>{displayName}</SmallBoldText>
        {props.user.type === MailsVisibleType.USER ? (
          <>
            {' - '}
            <SmallBoldText style={{ color: accountTypeInfos[profile!].color.regular }}>
              {accountTypeInfos[profile!].text}
            </SmallBoldText>
          </>
        ) : null}
      </SmallText>
      {props.isEditing ? (
        <TouchableOpacity onPress={onDelete}>
          <Svg
            name="ui-close"
            fill={theme.palette.grey.black}
            width={UI_SIZES.elements.icon.small}
            height={UI_SIZES.elements.icon.small}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};