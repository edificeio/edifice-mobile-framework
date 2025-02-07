import React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { MailsRecipientContainer, MailsRecipientContainerProps } from '~/framework/modules/mails/components/recipient-item';

import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
import { MailsRecipientGroupInfo, MailsVisible } from '~/framework/modules/mails/model';
import styles from './styles';

const renderSubtitle = (nbUsers, disabled) => {
  //if (disabled) return <SmallText style={styles.graphite}>{I18n.get('conversation-newmail-broadcastgroupsubtitle')}</SmallText>;
  if (nbUsers)
    return (
      <SmallText style={styles.graphite}>
        {nbUsers} {I18n.get(nbUsers > 1 ? 'conversation-newmail-communicationmembres' : 'conversation-newmail-communicationmembre')}
      </SmallText>
    );
};

const MailsRecipientGroupItem = (props: MailsRecipientContainerProps) => {
  const { displayName, type, id } = props.item as MailsRecipientGroupInfo | MailsVisible;

  return (
    <MailsRecipientContainer {...props}>
      <MailsRecipientAvatar id={id} type={type} />
      <View style={styles.flex1}>
        <SmallBoldText numberOfLines={1} ellipsizeMode="tail" style={props.disabled ? styles.graphite : {}}>
          {displayName}
        </SmallBoldText>
        {props.item.size ? renderSubtitle(props.item.size, props.disabled) : null}
      </View>
    </MailsRecipientContainer>
  );
};

export default MailsRecipientGroupItem;
