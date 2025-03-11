import React from 'react';
import { View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
import { MailsRecipientContainer, MailsRecipientContainerProps } from '~/framework/modules/mails/components/recipient-item';
import { MailsRecipientGroupInfo, MailsVisible } from '~/framework/modules/mails/model';

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
  const { displayName, id, nbUsers, size, type } = props.item as MailsRecipientGroupInfo | MailsVisible;

  return (
    <MailsRecipientContainer {...props}>
      <MailsRecipientAvatar id={id} type={type} />
      <View style={styles.flex1}>
        <SmallBoldText numberOfLines={1} ellipsizeMode="tail" style={props.disabled ? styles.graphite : {}}>
          {displayName}
        </SmallBoldText>
        {size || nbUsers ? renderSubtitle(size ?? nbUsers, props.disabled) : null}
      </View>
    </MailsRecipientContainer>
  );
};

export default MailsRecipientGroupItem;
