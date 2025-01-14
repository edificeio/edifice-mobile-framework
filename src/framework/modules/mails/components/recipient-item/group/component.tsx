import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { containerStyle, MailsRecipientGroupItemProps } from '~/framework/modules/mails/components/recipient-item';

import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
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

const MailsRecipientGroupItem = (props: MailsRecipientGroupItemProps) => {
  const { displayName, type, id } = props.item;

  return (
    <TouchableOpacity disabled={props.onPress ? false : true} onPress={props.onPress} style={containerStyle}>
      <MailsRecipientAvatar id={id} type={type} />
      <View style={styles.flex1}>
        <SmallBoldText numberOfLines={1} ellipsizeMode="tail" style={props.disabled ? styles.graphite : {}}>
          {displayName}
        </SmallBoldText>
        {props.item.size ? renderSubtitle(props.item.size, props.disabled) : null}
      </View>
    </TouchableOpacity>
  );
};

export default MailsRecipientGroupItem;
