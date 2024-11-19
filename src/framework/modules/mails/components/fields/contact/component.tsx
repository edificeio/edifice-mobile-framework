/* eslint-disable react-native/no-raw-text */
import * as React from 'react';
import { TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

import styles from '../styles';
import { MailsContactFieldProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextInputType } from '~/framework/components/inputs/text/component';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, SmallBoldText } from '~/framework/components/text';
import MailsContactItem from '~/framework/modules/mails/components/contact-item';
import stylesContactItem from '~/framework/modules/mails/components/contact-item/styles';
import { MailsRecipientsType } from '~/framework/modules/mails/model';
import { MailsRecipientPrefixsI18n } from '~/framework/modules/mails/util';

export const MailsContactField = (props: MailsContactFieldProps) => {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const inputRef = React.useRef<TextInputType>(null);

  const onFocus = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  };

  const onBlur = () => {
    setIsEditing(false);
  };

  const onToggleMoreRecipientsFields = () => {
    if (props.onToggleMoreRecipientsFields) props.onToggleMoreRecipientsFields();
  };

  const renderRecipients = () => {
    const { onDelete, recipients } = props;

    if (isEditing || recipients.length <= 2) {
      return recipients.map(recipient => (
        <MailsContactItem
          key={recipient.id}
          id={recipient.id}
          name={recipient.displayName}
          type={recipient.type}
          isEditing={isEditing}
          onDelete={onDelete}
        />
      ));
    }

    return (
      <>
        <MailsContactItem
          key={recipients[0].id}
          id={recipients[0].id}
          name={recipients[0].displayName}
          type={recipients[0].type}
          isEditing={isEditing}
          onDelete={onDelete}
        />
        <MailsContactItem
          key={recipients[1].id}
          id={recipients[1].id}
          name={recipients[1].displayName}
          type={recipients[1].type}
          isEditing={isEditing}
          onDelete={onDelete}
        />
        <View style={[stylesContactItem.container, { paddingRight: UI_SIZES.spacing.tiny }]}>
          <SmallBoldText>+{recipients.length - 2}</SmallBoldText>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <BodyText style={styles.prefix}>{I18n.get(MailsRecipientPrefixsI18n[props.type].name)}</BodyText>
      <TouchableOpacity activeOpacity={1} disabled={isEditing} style={styles.middlePart} onPress={onFocus}>
        {props.recipients.length > 0 ? <View style={styles.recipientsList}>{renderRecipients()}</View> : null}
        {isEditing || props.recipients.length === 0 ? (
          <RNTextInput
            ref={inputRef}
            onBlur={onBlur}
            style={styles.input}
            placeholderTextColor={theme.palette.grey.graphite}
            placeholder={I18n.get(MailsRecipientPrefixsI18n[props.type].placeholder)}
          />
        ) : null}
      </TouchableOpacity>
      {props.type === MailsRecipientsType.TO ? (
        <TouchableOpacity
          style={[styles.button, props.isOpenMoreRecipientsFields ? styles.buttonOpen : {}]}
          onPress={onToggleMoreRecipientsFields}>
          <NamedSVG
            name="ui-rafterDown"
            fill={theme.palette.grey.black}
            width={UI_SIZES.elements.icon.small}
            height={UI_SIZES.elements.icon.small}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
