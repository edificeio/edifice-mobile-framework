/* eslint-disable react-native/no-raw-text */
import * as React from 'react';
import { Animated, Keyboard, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

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
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const INITIAL_HEIGHT_INPUT = 60;

export const MailsContactField = (props: MailsContactFieldProps) => {
  const [search, setSearch] = React.useState('');
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [ccCciPressed, setCcCciPressed] = React.useState<boolean>(false);
  const [allInputsSelectedRecipients, setAllInputsSelectedRecipients] = React.useState<string[]>(
    props.allInputsSelectedRecipients ?? [],
  );
  const [selectedRecipients, setSelectedRecipients] = React.useState<MailsVisible[]>(props.recipients ?? []);
  const [results, setResults] = React.useState<MailsVisible[]>([]);
  const [showList, setShowList] = React.useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [heightInputToSave, setHeightInputToSave] = React.useState(0);
  const [heightToRemoveList, setHeightToRemoveList] = React.useState(INITIAL_HEIGHT_INPUT);

  const topPositionResults = React.useRef(new Animated.Value(0)).current;

  const viewContainerRef = React.useRef<View>(null);
  const inputRef = React.useRef<TextInputType>(null);

  const resultsHeight = React.useMemo(
    () => UI_SIZES.getViewHeight({ withoutTabbar: false }) - keyboardHeight - heightToRemoveList,
    [heightToRemoveList, keyboardHeight],
  );

  const toggleShowList = () => {
    setShowList(!showList);
    props.onToggleShowList(!showList);
  };

  React.useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  React.useEffect(() => {
    setAllInputsSelectedRecipients(props.allInputsSelectedRecipients);
  }, [props.allInputsSelectedRecipients]);

  React.useEffect(() => {
    if (props.isStartScroll && showList) {
      inputRef.current?.blur();
      toggleShowList();
    }
  }, [props.isStartScroll]);

  React.useEffect(() => {
    if (props.inputFocused !== props.type && (isOpen || isEditing)) {
      if (isOpen) setIsOpen(false);
      if (isEditing) setIsEditing(false);
    }
  }, [isEditing, isOpen, props.inputFocused, props.type]);

  React.useEffect(() => {
    if (viewContainerRef.current) {
      setTimeout(() => {
        viewContainerRef.current!.measure((x, y, width, height, pageX, pageY) => {
          Animated.spring(topPositionResults, {
            friction: 8,
            tension: 50,
            toValue: y + height,
            useNativeDriver: true,
          }).start();
          setHeightToRemoveList(height - heightInputToSave + INITIAL_HEIGHT_INPUT);
        });
      }, 100);
    }
  }, [heightInputToSave, selectedRecipients, topPositionResults]);

  const scrollToInput = () => {
    if (viewContainerRef.current) {
      setTimeout(() => {
        viewContainerRef.current!.measure((x, y, width, height) => {
          setHeightToRemoveList(INITIAL_HEIGHT_INPUT);
          setHeightInputToSave(height);
          topPositionResults.setValue(y + height);
          props.richEditorRef.current?.scrollTo({ animated: true, y: y + height - INITIAL_HEIGHT_INPUT });
        });
      }, 300);
    }
  };

  const onOpen = () => setIsOpen(true);

  const onFocus = () => {
    scrollToInput();
    if (!isOpen) setIsOpen(true);
    if (search.length >= 3) toggleShowList();
    setIsEditing(true);
    props.onFocus(props.type);
  };

  const onBlur = () => setIsEditing(false);

  const onRemoveContentAndExitInput = () => {
    setSearch('');
    if (results.length) setResults([]);
    if (showList) toggleShowList();
  };

  const onChangeText = (text: string) => {
    setSearch(text);
    if (text.length >= 3) {
      const normalizedSearchText = removeAccents(text).toLowerCase();
      const newResults = props.visibles.filter(visible => {
        const normalizedDisplayName = removeAccents(visible.displayName).toLowerCase();
        return normalizedDisplayName.includes(normalizedSearchText);
      });
      setResults(newResults);
      if (!showList) toggleShowList();
    } else {
      if (showList) toggleShowList();
      scrollToInput();
    }
  };

  const addUser = (user: MailsVisible) => {
    const newSelectedRecipients = [...selectedRecipients, user];
    setSelectedRecipients(newSelectedRecipients);
    props.onChangeRecipient(newSelectedRecipients, props.type, user.id);
  };

  const removeUser = (user: MailsVisible) => {
    const newSelectedRecipients = selectedRecipients.filter(selectedRecipient => selectedRecipient.id !== user.id);
    setSelectedRecipients(newSelectedRecipients);
    props.onChangeRecipient(newSelectedRecipients, props.type, user.id);
  };

  const onOpenMoreRecipientsFields = () => {
    setCcCciPressed(true);
    if (props.onOpenMoreRecipientsFields) props.onOpenMoreRecipientsFields();
  };

  const renderRecipients = () => {
    if (isOpen || selectedRecipients.length <= 2) {
      return selectedRecipients.map(recipient => (
        <MailsContactItem key={recipient.id} user={recipient} isEditing={isOpen} onDelete={removeUser} />
      ));
    }
    return (
      <>
        <MailsContactItem key={selectedRecipients[0].id} user={selectedRecipients[0]} isEditing={isOpen} onDelete={removeUser} />
        <MailsContactItem key={selectedRecipients[1].id} user={selectedRecipients[1]} isEditing={isOpen} onDelete={removeUser} />
        <View style={[stylesContactItem.container, stylesContactItem.containerNumber]}>
          <SmallBoldText>+{selectedRecipients.length - 2}</SmallBoldText>
        </View>
      </>
    );
  };

  const renderInfoInInput = () => {
    if (search.length > 0)
      return (
        <TouchableOpacity style={styles.iconClose} onPress={onRemoveContentAndExitInput}>
          <Svg
            name="ui-close"
            fill={theme.palette.grey.black}
            height={UI_SIZES.elements.icon.default}
            width={UI_SIZES.elements.icon.default}
          />
        </TouchableOpacity>
      );
    if (props.type === MailsRecipientsType.TO && !ccCciPressed && !props.hideCcCciButton)
      return (
        <TouchableOpacity style={styles.iconCcCci} onPress={onOpenMoreRecipientsFields}>
          <SmallBoldText style={styles.textButton}>{`${I18n.get('mails-edit-cc')}  ${I18n.get('mails-edit-cci')}`}</SmallBoldText>
        </TouchableOpacity>
      );
    return null;
  };

  return (
    <>
      <View style={styles.container} ref={viewContainerRef}>
        <BodyText style={styles.prefix}>{I18n.get(MailsRecipientPrefixsI18n[props.type].name)}</BodyText>
        <View style={[styles.containerInput, isOpen ? styles.containerIsEditing : {}]}>
          <TouchableOpacity
            activeOpacity={1}
            disabled={isOpen || selectedRecipients.length === 0}
            style={styles.middlePart}
            onPress={onOpen}>
            {selectedRecipients.length > 0 ? <View style={styles.recipientsList}>{renderRecipients()}</View> : null}
            {isOpen || selectedRecipients.length === 0 ? (
              <RNTextInput
                ref={inputRef}
                onBlur={onBlur}
                onFocus={onFocus}
                style={styles.input}
                placeholderTextColor={theme.palette.grey.graphite}
                placeholder={I18n.get(MailsRecipientPrefixsI18n[props.type].placeholder)}
                onChangeText={onChangeText}
                value={search}
                autoCorrect={false}
                autoCapitalize="none"
                spellCheck={false}
              />
            ) : null}
          </TouchableOpacity>
          {renderInfoInInput()}
        </View>
      </View>
      {showList ? (
        <Animated.View
          style={[
            styles.resultsList,
            {
              height: resultsHeight,
              minHeight: resultsHeight,
              transform: [{ translateY: topPositionResults }],
            },
          ]}>
          <FlatList
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            bounces={false}
            data={results}
            contentContainerStyle={[
              styles.results,
              {
                minHeight: resultsHeight,
              },
            ]}
            ListHeaderComponent={
              <SmallBoldText style={styles.nbResults}>
                {I18n.get(results.length > 1 ? 'mails-edit-results' : 'mails-edit-result', { nb: results.length })}
              </SmallBoldText>
            }
            renderItem={({ item }) => {
              const Component = item.type === MailsVisibleType.GROUP ? MailsRecipientGroupItem : MailsRecipientUserItem;
              return <Component item={item} onPress={addUser} selected={allInputsSelectedRecipients.includes(item.id)} />;
            }}
            ListEmptyComponent={<SmallBoldText>Pas de résultats</SmallBoldText>}
          />
        </Animated.View>
      ) : null}
    </>
  );
};
