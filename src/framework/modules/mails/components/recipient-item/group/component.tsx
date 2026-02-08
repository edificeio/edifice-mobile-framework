import React from 'react';
import { View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
import { MailsRecipientContainer, MailsRecipientContainerProps } from '~/framework/modules/mails/components/recipient-item';
import { MailsRecipientGroupInfo, MailsVisible, MailsVisibleType } from '~/framework/modules/mails/model';
import { getExternalInitials } from '~/framework/modules/mails/util';

const renderSubtitle = (nbUsers, disabled) => {
  if (disabled) return <SmallText style={styles.graphite}>{I18n.get('mails-edit-broadcastgroupsubtitle')}</SmallText>;
  if (nbUsers)
    return (
      <SmallText style={styles.graphite}>
        {nbUsers} {I18n.get(nbUsers > 1 ? 'mails-edit-members' : 'mails-edit-member')}
      </SmallText>
    );
};

const MailsRecipientGroupItem = (props: MailsRecipientContainerProps) => {
  const { displayName, id, nbUsers, size, subType, type } = props.item as MailsRecipientGroupInfo & MailsVisible;
  const { disabled } = props;
  const isExternal = type === MailsVisibleType.EXTERNAL;

  const renderAvatar = () => {
    if (isExternal) {
      const initials = getExternalInitials(displayName);
      return (
        <View style={styles.avatar}>
          <SmallBoldText style={styles.avatarText}>{initials}</SmallBoldText>
        </View>
      );
    }
    return <MailsRecipientAvatar id={id} type={subType || type} />;
  };

  return (
    <MailsRecipientContainer {...props}>
      {renderAvatar()}
      <View style={styles.flex1}>
        <SmallBoldText numberOfLines={1} ellipsizeMode="tail" style={props.disabled ? styles.graphite : {}}>
          {displayName}
        </SmallBoldText>
        {isExternal ? (
          <SmallText style={styles.idText} numberOfLines={1} ellipsizeMode="tail">
            {id}
          </SmallText>
        ) : size || nbUsers ? (
          renderSubtitle(size ?? nbUsers, disabled)
        ) : null}
      </View>
    </MailsRecipientContainer>
  );
};

export default MailsRecipientGroupItem;
