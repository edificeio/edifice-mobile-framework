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
import { Svg } from '~/framework/components/picture';
import { BodyText, SmallBoldText } from '~/framework/components/text';
import MailsContactItem from '~/framework/modules/mails/components/contact-item';
import stylesContactItem from '~/framework/modules/mails/components/contact-item/styles';
import { MailsRecipientGroupItem, MailsRecipientUserItem } from '~/framework/modules/mails/components/recipient-item';
import { MailsRecipientsType, MailsVisible, MailsVisibleType } from '~/framework/modules/mails/model';
import { MailsRecipientPrefixsI18n } from '~/framework/modules/mails/util';

function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Supprime les diacritiques
}

export const MailsContactField = (props: MailsContactFieldProps) => {
  const [search, setSearch] = React.useState('');
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [ccCciPressed, setCcCciPressed] = React.useState<boolean>(false);
  const [selectedRecipients, setSelectedRecipients] = React.useState<MailsVisible[]>(props.recipients ?? []);
  const [visibles, setVisibles] = React.useState<MailsVisible[]>([]);
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
    props.onBlur(visibles);
    if (results.length === 0) {
      setSearch('');
      setIsEditing(false);
    }
  };

  const onExitInput = () => {
    setSearch('');
    setIsEditing(false);
    setShowList(false);
    setResults([]);
    inputRef.current?.blur();
  };

  const onChangeText = (text: string) => {
    setSearch(text);
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
    setSearch('');
    const newSelectedRecipients = [...selectedRecipients, user];
    setSelectedRecipients(newSelectedRecipients);
    setVisibles(prev => prev.filter(visible => visible.id !== user.id));
    setResults(prev => prev.filter(result => result.id !== user.id));
    props.onChangeRecipient(newSelectedRecipients, props.type);
  };

  const removeUser = (user: MailsVisible) => {
    const newSelectedRecipients = selectedRecipients.filter(selectedRecipient => selectedRecipient.id !== user.id);
    setSelectedRecipients(newSelectedRecipients);
    setVisibles(prev => [user, ...prev]);
    props.onChangeRecipient(newSelectedRecipients, props.type);
  };

  const onOpenMoreRecipientsFields = () => {
    setCcCciPressed(true);
    if (props.onOpenMoreRecipientsFields) props.onOpenMoreRecipientsFields();
  };

  React.useEffect(() => {
    setVisibles(props.visibles);
  }, [props.visibles]);

  const renderRecipients = () => {
    if (isEditing || selectedRecipients.length <= 2) {
      return selectedRecipients.map(recipient => (
        <MailsContactItem key={recipient.id} user={recipient} isEditing={isEditing} onDelete={removeUser} />
      ));
    }
    return (
      <>
        <MailsContactItem key={selectedRecipients[0].id} user={selectedRecipients[0]} isEditing={isEditing} onDelete={removeUser} />
        <MailsContactItem key={selectedRecipients[1].id} user={selectedRecipients[1]} isEditing={isEditing} onDelete={removeUser} />
        <View style={[stylesContactItem.container, stylesContactItem.containerNumber]}>
          <SmallBoldText>+{selectedRecipients.length - 2}</SmallBoldText>
        </View>
      </>
    );
  };

  const renderInfoInInput = () => {
    if (isEditing)
      return (
        <TouchableOpacity style={styles.iconClose} onPress={onExitInput}>
          <Svg
            name="ui-close"
            fill={theme.palette.grey.black}
            height={UI_SIZES.elements.icon.default}
            width={UI_SIZES.elements.icon.default}
          />
        </TouchableOpacity>
      );
    if (props.type === MailsRecipientsType.TO && !ccCciPressed)
      return (
        <TouchableOpacity style={styles.iconCcCci} onPress={onOpenMoreRecipientsFields}>
          <SmallBoldText style={styles.textButton}>{`${I18n.get('mails-edit-cc')}  ${I18n.get('mails-edit-cci')}`}</SmallBoldText>
        </TouchableOpacity>
      );
    return null;
  };

  return (
    <>
      <View style={styles.container}>
        <BodyText style={styles.prefix}>{I18n.get(MailsRecipientPrefixsI18n[props.type].name)}</BodyText>
        <View style={[styles.containerInput, isEditing ? styles.containerIsEditing : {}]}>
          <TouchableOpacity activeOpacity={1} disabled={isEditing} style={styles.middlePart} onPress={onFocus}>
            {selectedRecipients.length > 0 ? <View style={styles.recipientsList}>{renderRecipients()}</View> : null}
            {isEditing || selectedRecipients.length === 0 ? (
              <RNTextInput
                ref={inputRef}
                onBlur={onBlur}
                onFocus={onFocus}
                style={styles.input}
                placeholderTextColor={theme.palette.grey.graphite}
                placeholder={I18n.get(MailsRecipientPrefixsI18n[props.type].placeholder)}
                onChangeText={onChangeText}
                value={search}
                returnKeyType="next"
              />
            ) : null}
          </TouchableOpacity>
          {renderInfoInInput()}
        </View>
      </View>
      {showList && results.length ? (
        <FlatList
          keyboardShouldPersistTaps="always"
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
