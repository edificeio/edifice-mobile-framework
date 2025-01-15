/* eslint-disable react-native/no-raw-text */
import * as React from 'react';
import { TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

import styles from '../styles';
import { MailsContactFieldProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextInputType } from '~/framework/components/inputs/text/component';
import FlatList from '~/framework/components/list/flat-list';
import { BodyText, SmallBoldText } from '~/framework/components/text';
import MailsContactItem from '~/framework/modules/mails/components/contact-item';
import stylesContactItem from '~/framework/modules/mails/components/contact-item/styles';
import { MailsRecipientsType, MailsVisible, MailsVisibleType } from '~/framework/modules/mails/model';
import { MailsRecipientPrefixsI18n } from '~/framework/modules/mails/util';
import { MailsRecipientGroupItem, MailsRecipientUserItem } from '../../recipient-item';

function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Supprime les diacritiques
}

export const MailsContactField = (props: MailsContactFieldProps) => {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = React.useState<MailsVisible[]>(props.recipients);
  const [visibles, setVisibles] = React.useState<MailsVisible[]>(props.visibles || []);
  const [results, setResults] = React.useState<MailsVisible[]>([]);
  const [showList, setShowList] = React.useState<boolean>(false);

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

  const onChangeText = (text: string) => {
    if (text.length >= 3) {
      const normalizedSearchText = removeAccents(text).toLowerCase();
      const newResults = visibles.filter(visible => {
        const normalizedDisplayName = removeAccents(visible.displayName).toLowerCase();
        return normalizedDisplayName.includes(normalizedSearchText);
      });
      setResults(newResults);
      setShowList(true);
    } else {
      if (showList) setShowList(false);
    }
  };

  const addUser = (user: MailsVisible) => {
    setSelectedUsers(prev => [...prev, user]);
    setVisibles(prev => prev.filter(visible => visible.id !== user.id));
    setResults(prev => prev.filter(result => result.id !== user.id));
  };

  const removeUser = (user: MailsVisible) => {
    setSelectedUsers(prev => prev.filter(selectedUser => selectedUser.id !== user.id));
    setVisibles(prev => [user, ...prev]);
  };

  const onToggleMoreRecipientsFields = () => {
    if (props.onToggleMoreRecipientsFields) props.onToggleMoreRecipientsFields();
  };

  const renderRecipients = () => {
    if (isEditing || selectedUsers.length <= 2) {
      return selectedUsers.map(recipient => (
        <MailsContactItem key={recipient.id} user={recipient} isEditing={isEditing} onDelete={removeUser} />
      ));
    }

    return (
      <>
        <MailsContactItem key={selectedUsers[0].id} user={selectedUsers[0]} isEditing={isEditing} onDelete={removeUser} />
        <MailsContactItem key={selectedUsers[1].id} user={selectedUsers[1]} isEditing={isEditing} onDelete={removeUser} />
        <View style={[stylesContactItem.container, { paddingRight: UI_SIZES.spacing.tiny }]}>
          <SmallBoldText>+{selectedUsers.length - 2}</SmallBoldText>
        </View>
      </>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <BodyText style={styles.prefix}>{I18n.get(MailsRecipientPrefixsI18n[props.type].name)}</BodyText>
        <TouchableOpacity activeOpacity={1} disabled={isEditing} style={styles.middlePart} onPress={onFocus}>
          {selectedUsers.length > 0 ? <View style={styles.recipientsList}>{renderRecipients()}</View> : null}
          {isEditing || selectedUsers.length === 0 ? (
            <RNTextInput
              ref={inputRef}
              onBlur={onBlur}
              onFocus={onFocus}
              style={styles.input}
              placeholderTextColor={theme.palette.grey.graphite}
              placeholder={I18n.get(MailsRecipientPrefixsI18n[props.type].placeholder)}
              onChangeText={onChangeText}
            />
          ) : null}
        </TouchableOpacity>
        {props.type === MailsRecipientsType.TO ? (
          <TouchableOpacity onPress={onToggleMoreRecipientsFields}>
            <SmallBoldText style={styles.textButton}>{`${I18n.get('mails-edit-cc')} ${I18n.get('mails-edit-cci')}`}</SmallBoldText>
          </TouchableOpacity>
        ) : null}
      </View>
      {showList && results.length ? (
        <FlatList
          data={results}
          contentContainerStyle={styles.results}
          ListHeaderComponent={
            <SmallBoldText style={styles.nbResults}>
              {I18n.get(results.length > 1 ? 'mails-edit-results' : 'mails-edit-result', { nb: results.length })}
            </SmallBoldText>
          }
          bottomInset={false}
          renderItem={({ item }) => {
            const Component = item.type === MailsVisibleType.GROUP ? MailsRecipientGroupItem : MailsRecipientUserItem;
            return <Component item={item} onPress={addUser} />;
          }}
        />
      ) : null}
    </>
  );
};
