import * as React from 'react';
import { Animated, Keyboard, Platform, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

import debounce from 'lodash.debounce';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextInputType } from '~/framework/components/inputs/text/component';
import FlatList from '~/framework/components/list/flat-list';
import { Svg } from '~/framework/components/picture';
import { BodyText, HeadingSText, SmallBoldText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';
import MailsContactItem from '~/framework/modules/mails/components/contact-item';
import stylesContactItem from '~/framework/modules/mails/components/contact-item/styles';
import styles from '~/framework/modules/mails/components/fields/styles';
import { MailsRecipientGroupItem, MailsRecipientUserItem } from '~/framework/modules/mails/components/recipient-item';
import { HEIGHT_RECIPIENT_CONTAINER } from '~/framework/modules/mails/components/recipient-item/container/styles';
import { MailsRecipientsType, MailsVisible, MailsVisibleType } from '~/framework/modules/mails/model';
import { mailsService } from '~/framework/modules/mails/service';
import { readVisibles } from '~/framework/modules/mails/storage';
import { isServiceMethodAvailable, MailsRecipientPrefixsI18n } from '~/framework/modules/mails/util';

import { MailsContactFieldProps } from './types';

function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Basic email validation for manual entry
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

const HEIGHT_HEADER_RESULTS = UI_SIZES.spacing.small + TextSizeStyle.Normal.lineHeight;
const INITIAL_HEIGHT_INPUT = UI_SIZES.spacing.small * 2 + UI_SIZES.spacing.tiny * 2 + TextSizeStyle.Medium.lineHeight;

export const MailsContactField = (props: MailsContactFieldProps) => {
  const [search, setSearch] = React.useState('');
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [ccCciPressed, setCcCciPressed] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [filteredUsers, setFilteredUsers] = React.useState<MailsVisible[]>([]);
  const [showList, setShowList] = React.useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [heightInputToSave, setHeightInputToSave] = React.useState(0);
  const [heightToRemoveList, setHeightToRemoveList] = React.useState(INITIAL_HEIGHT_INPUT);
  const [focused, setFocused] = React.useState(false);
  const [inputFocused, setInputFocused] = React.useState(false);
  const [containerLayout, setContainerLayout] = React.useState({ height: 0, width: 0, x: 0, y: 0 });

  const users: MailsVisible[] = React.useMemo(() => readVisibles(), []);

  const topPositionResults = React.useRef(new Animated.Value(0)).current;

  const viewContainerRef = React.useRef<View>(null);
  const inputRef = React.useRef<TextInputType>(null);
  const lastManualQuery = React.useRef<string>('');

  const resultsHeight = React.useMemo(
    () => UI_SIZES.getViewHeight({ withoutTabbar: false }) - keyboardHeight - heightToRemoveList,
    [heightToRemoveList, keyboardHeight],
  );
  const onSubmitManualSearch = () => {
    const normalized = removeAccents(search).toLowerCase();

    if (normalized.length >= 2) {
      lastManualQuery.current = normalized;
      const filterFunction = onSearch(normalized);
      const result = users.filter(user => filterFunction(user));
      setFilteredUsers(result);
      setLoading(false);
      if (!showList) toggleShowList();
    }
  };

  const toggleShowList = React.useCallback(() => {
    setShowList(!showList);
    props.onToggleShowList(!showList);
  }, [props, showList]);

  React.useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardWillHide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  React.useEffect(() => {
    if (props.isStartScroll && showList && search === '') {
      inputRef.current?.blur();
      toggleShowList();
    }
  }, [props.isStartScroll, showList, search, toggleShowList]);

  React.useEffect(() => {
    if (props.inputFocused !== props.type && isOpen && !focused) setIsOpen(false);
  }, [focused, isOpen, props.inputFocused, props.type]);

  React.useEffect(() => {
    if (props.inputFocused !== props.type) {
      setFocused(false);
    }
  }, [props.inputFocused, props.type]);

  React.useEffect(() => {
    if (viewContainerRef.current) {
      setTimeout(() => {
        Animated.spring(topPositionResults, {
          friction: 8,
          tension: 50,
          toValue: containerLayout.y + containerLayout.height,
          useNativeDriver: true,
        }).start();
        setHeightToRemoveList(containerLayout.height - heightInputToSave + INITIAL_HEIGHT_INPUT);
      }, 100);
    }
  }, [containerLayout.height, containerLayout.y, heightInputToSave, props.recipients, topPositionResults]);

  const scrollToInput = React.useCallback(() => {
    if (viewContainerRef.current) {
      setTimeout(() => {
        setHeightToRemoveList(INITIAL_HEIGHT_INPUT);
        setHeightInputToSave(containerLayout.height);
        topPositionResults.setValue(containerLayout.y + containerLayout.height);
        props.scrollViewRef.current?.scrollTo({
          animated: true,
          y: containerLayout.y + containerLayout.height - INITIAL_HEIGHT_INPUT,
        });
      }, 200);
    }
  }, [containerLayout, props.scrollViewRef, topPositionResults]);

  React.useEffect(() => {
    if (containerLayout.height > 0 && inputFocused) {
      setTimeout(() => {
        scrollToInput();
      }, 300);
    }
  }, [containerLayout, isOpen, scrollToInput, showList, inputFocused]);

  const onOpen = React.useCallback(() => {
    setFocused(true);
    setIsOpen(true);

    props.onFocus(props.type);
  }, [props]);

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const onFocus = React.useCallback(() => {
    setInputFocused(true);
    if (!isOpen) setIsOpen(true);
    props.onFocus(props.type);
  }, [isOpen, props]);

  const onBlur = React.useCallback(() => {
    setInputFocused(false);
    setFocused(false);

    if (search === '') {
      setIsOpen(false);
    }
  }, [search]);

  const onRemoveContentAndExitInput = React.useCallback(() => {
    setSearch('');
    lastManualQuery.current = '';
    if (filteredUsers.length) setFilteredUsers([]);
    if (showList) toggleShowList();
  }, [filteredUsers.length, showList, toggleShowList]);

  const onSearch = (query: string) => {
    let testDisplayNames: string[] = [],
      testNameReverseds: string[] = [];

    function addSearchTerm(displayName: string): void {
      const testDisplayName = removeAccents(displayName).toLowerCase();
      testDisplayNames.push(testDisplayName);
      const split = testDisplayName.split(' ');
      testNameReverseds.push(split.length > 1 ? split[1] + ' ' + split[0] : testDisplayName);
    }

    return (user: MailsVisible) => {
      testDisplayNames = [];
      testNameReverseds = [];

      if (user.displayName) {
        addSearchTerm(user.displayName);
      }
      if (user.children) {
        user.children.forEach(child => {
          addSearchTerm(child.displayName);
        });
      }
      if (user.relatives) {
        user.relatives.forEach(relative => {
          addSearchTerm(relative.displayName);
        });
      }
      return (
        testDisplayNames.some(name => name.indexOf(query) !== -1) || testNameReverseds.some(name => name.indexOf(query) !== -1)
      );
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = React.useCallback(
    debounce(text => {
      if (isServiceMethodAvailable(mailsService.visibles.getOnSearch)) {
        mailsService.visibles.getOnSearch(text).then(result => {
          if (isValidEmail(text)) {
            const newRecipient: MailsVisible = {
              displayName: text,
              id: text,
              profile: AccountType.External,
              type: MailsVisibleType.EXTERNAL,
            };

            result = [newRecipient, ...result];
          }

          setFilteredUsers(result);
          setLoading(false);
        });
      } else {
        const filterFunction = onSearch(text);
        const result = users.filter(user => filterFunction(user));
        setFilteredUsers(result);
        setLoading(false);
      }
    }, 500),
    [],
  );

  const onChangeText = (text: string) => {
    const minTextLength = props.isAdml ? 3 : 1;
    setSearch(text);
    if (text.length >= minTextLength) {
      const normalizedSearchText = removeAccents(text).toLowerCase();
      if (!loading) setLoading(true);
      debouncedSearch(normalizedSearchText);
      if (!showList) toggleShowList();
    } else {
      if (showList) toggleShowList();
      scrollToInput();
    }
  };

  const addUser = React.useCallback(
    (items: MailsVisible[]) => {
      const newSelectedRecipients = [...props.recipients, ...items.filter(item => !props.recipients.some(r => r.id === item.id))];

      props.onChangeRecipient(newSelectedRecipients, props.type);
      onRemoveContentAndExitInput();
    },
    [props, onRemoveContentAndExitInput],
  );

  const removeUser = React.useCallback(
    (user: MailsVisible) => {
      props.onChangeRecipient(
        props.recipients.filter(r => r.id !== user.id),
        props.type,
      );
    },
    [props],
  );

  const onOpenMoreRecipientsFields = React.useCallback(() => {
    setCcCciPressed(true);
    if (props.onOpenMoreRecipientsFields) {
      props.onOpenMoreRecipientsFields();
      onFocus();
    }
  }, [onFocus, props]);

  const isInputReallyFocused = React.useMemo(() => isOpen, [isOpen]);
  const renderRecipients = React.useCallback(() => {
    if (isInputReallyFocused || props.recipients.length <= 2) {
      return props.recipients.map(recipient => (
        <MailsContactItem key={recipient.id} user={recipient} isEditing={isInputReallyFocused} onDelete={removeUser} />
      ));
    }

    const [first, second, ...remaining] = props.recipients;

    return (
      <>
        <MailsContactItem key={first.id} user={first} isEditing={isInputReallyFocused} onDelete={removeUser} />
        <MailsContactItem key={second.id} user={second} isEditing={isInputReallyFocused} onDelete={removeUser} />
        <View style={[stylesContactItem.container, stylesContactItem.containerNumber]}>
          <SmallBoldText>+{remaining.length}</SmallBoldText>
        </View>
      </>
    );
  }, [isInputReallyFocused, props.recipients, removeUser]);

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

  const heightResults = React.useMemo(() => {
    return filteredUsers.length * HEIGHT_RECIPIENT_CONTAINER + HEIGHT_HEADER_RESULTS + UI_SIZES.spacing.small * 2 + 170;
  }, [filteredUsers]);

  const conRenderRecipients = React.useMemo(() => props.recipients.length === 0 || isOpen, [props.recipients.length, isOpen]);

  return (
    <>
      <View
        style={[styles.container, props.recipients.length === 0 ? styles.containerEmpty : {}]}
        ref={viewContainerRef}
        onLayout={e => {
          const { height, width, x, y } = e.nativeEvent.layout;
          setContainerLayout({ height, width, x, y });
        }}>
        <BodyText style={styles.prefix}>{I18n.get(MailsRecipientPrefixsI18n[props.type].name)}</BodyText>
        <View style={[styles.containerInput, isOpen ? styles.containerIsEditing : {}]}>
          <TouchableOpacity activeOpacity={1} disabled={conRenderRecipients} style={styles.middlePart} onPress={onOpen}>
            {props.recipients.length > 0 ? <View style={styles.recipientsList}>{renderRecipients()}</View> : null}
            {conRenderRecipients ? (
              <RNTextInput
                ref={inputRef}
                onFocus={onFocus}
                onBlur={onBlur}
                style={styles.input}
                placeholderTextColor={theme.palette.grey.graphite}
                placeholder={
                  props.isAdml && inputFocused
                    ? I18n.get('mails-edit-placeholderadml')
                    : I18n.get(MailsRecipientPrefixsI18n[props.type].placeholder)
                }
                onChangeText={onChangeText}
                value={search}
                autoCorrect={false}
                autoCapitalize="none"
                spellCheck={false}
                returnKeyType="done"
                onSubmitEditing={onSubmitManualSearch}
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
          {loading ? (
            <View style={[styles.results, styles.loading]}>
              <Svg
                name="ui-loader"
                fill={theme.palette.primary.regular}
                width={UI_SIZES.elements.icon.medium}
                height={UI_SIZES.elements.icon.medium}
              />
              <SmallBoldText>{I18n.get('mails-edit-loading')}</SmallBoldText>
            </View>
          ) : (
            <FlatList
              keyboardShouldPersistTaps="handled"
              // keyboardDismissMode="on-drag" // if active dismisses keyboard on auto search when scrolling list
              showsVerticalScrollIndicator={false}
              bounces={false}
              data={filteredUsers}
              contentContainerStyle={[
                styles.results,
                {
                  height: heightResults,
                },
              ]}
              ListHeaderComponent={
                filteredUsers.length > 0 ? (
                  <SmallBoldText style={styles.nbResults}>
                    {I18n.get(filteredUsers.length > 1 ? 'mails-edit-results' : 'mails-edit-result', { nb: filteredUsers.length })}
                  </SmallBoldText>
                ) : null
              }
              renderItem={({ item }) => {
                const Component = item.type === MailsVisibleType.USER ? MailsRecipientUserItem : MailsRecipientGroupItem;
                const isSelected = props.recipients.some(selectedRecipient => selectedRecipient.id === item.id);
                return (
                  <Component
                    item={item}
                    onPress={addUser}
                    selected={isSelected}
                    disabled={item.type === MailsVisibleType.BROADCASTGROUP && props.type !== MailsRecipientsType.CCI}
                  />
                );
              }}
              ListEmptyComponent={
                <View style={styles.noResults}>
                  <HeadingSText style={styles.noResultsText}>{I18n.get('mails-edit-noresulttitle', { text: search })}</HeadingSText>
                  <SmallText style={styles.noResultsText}>{I18n.get('mails-edit-noresulttext')}</SmallText>
                </View>
              }
            />
          )}
        </Animated.View>
      ) : null}
    </>
  );
};
