import * as React from 'react';
import { Animated, Keyboard, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

import debounce from 'lodash.debounce';

import styles from '../styles';
import { MailsContactFieldProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextInputType } from '~/framework/components/inputs/text/component';
import FlatList from '~/framework/components/list/flat-list';
import { Svg } from '~/framework/components/picture';
import { BodyText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import MailsContactItem from '~/framework/modules/mails/components/contact-item';
import stylesContactItem from '~/framework/modules/mails/components/contact-item/styles';
import { MailsRecipientGroupItem, MailsRecipientUserItem } from '~/framework/modules/mails/components/recipient-item';
import { MailsRecipientsType, MailsVisible, MailsVisibleType } from '~/framework/modules/mails/model';
import { readVisibles } from '~/framework/modules/mails/storage';
import { MailsRecipientPrefixsI18n } from '~/framework/modules/mails/util';

function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const INITIAL_HEIGHT_INPUT = 60;

export const MailsContactField = (props: MailsContactFieldProps) => {
  const [search, setSearch] = React.useState('');
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [ccCciPressed, setCcCciPressed] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedRecipients, setSelectedRecipients] = React.useState<MailsVisible[]>(props.recipients ?? []);
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

  const resultsHeight = React.useMemo(
    () => UI_SIZES.getViewHeight({ withoutTabbar: false }) - keyboardHeight - heightToRemoveList,
    [heightToRemoveList, keyboardHeight],
  );

  const toggleShowList = React.useCallback(() => {
    setShowList(!showList);
    props.onToggleShowList(!showList);
  }, [props, showList]);

  React.useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardWillHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  React.useEffect(() => {
    if (props.isStartScroll && showList) {
      inputRef.current?.blur();
      toggleShowList();
    }
  }, [props.isStartScroll, showList, toggleShowList]);

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
        // console.log('measure', containerLayout.y, containerLayout.height);
        Animated.spring(topPositionResults, {
          friction: 8,
          tension: 50,
          toValue: containerLayout.y + containerLayout.height,
          useNativeDriver: true,
        }).start();
        setHeightToRemoveList(containerLayout.height - heightInputToSave + INITIAL_HEIGHT_INPUT);
      }, 100);
    }
  }, [containerLayout.height, containerLayout.y, heightInputToSave, selectedRecipients, topPositionResults]);

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

  /**
   * J'ai retiré tout appel de scrollToInput dans les autres fonctions
   * car il est déjà appelé dans useEffect quand la taille de la view change
   * et ça évite de trigger le scrollToInput à chaque fois et donc une ui laggy
   * La taille de la view change quand on ajoute ou supprime un recipient, ce qui trigger ce useEffect
   */
  React.useEffect(() => {
    // Trouver la bonne condition pour ne pas faire de scroll si le champ n'est pas ouvert ou s'il n'est pas focus
    // À chaud, je dirais que c'est ici que tu dois travailler pour éviter le scroll quand tu supprimes des recipients dans un autre champ
    // Je n'ai pas pris le temps de chercher la bonne condition
    if (containerLayout.height > 0 && inputFocused) {
      setTimeout(() => {
        scrollToInput();
      }, 300);
    }
  }, [containerLayout, isOpen, scrollToInput, showList, inputFocused]); // TODO: mettre à jour les dépendances, je n'ai pas clean suite à quelques tests

  const onOpen = () => {
    setFocused(true);
    setIsOpen(true);
  };

  const onFocus = () => {
    // Je crois que c'était un test, je ne sais plus pourquoi je l'ai commenté, à voir si ça pose problème
    // scrollToInput();
    setInputFocused(true);
    if (!isOpen) setIsOpen(true);
    if (search.length >= 3) toggleShowList();
    props.onFocus(props.type);
  };

  const onBlur = () => {
    setInputFocused(false);
  };

  const onRemoveContentAndExitInput = () => {
    setSearch('');
    if (filteredUsers.length) setFilteredUsers([]);
    if (showList) toggleShowList();
  };

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
      const filterFunction = onSearch(text);
      const result = users.filter(user => filterFunction(user));
      setFilteredUsers(result);
      setLoading(false);
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

  const addUser = (items: MailsVisible[]) => {
    items = items.filter(item => !selectedRecipients.some(selectedRecipient => selectedRecipient.id === item.id));
    const newSelectedRecipients = [...selectedRecipients, ...items];
    setSelectedRecipients(newSelectedRecipients);
    props.onChangeRecipient(newSelectedRecipients, props.type);
    // Evite d'appeler scrollToInput, il est déjà appelé car la taille de la view change
    // scrollToInput();
  };

  const removeUser = (user: MailsVisible) => {
    const newSelectedRecipients = selectedRecipients.filter(selectedRecipient => selectedRecipient.id !== user.id);
    setSelectedRecipients(newSelectedRecipients);
    props.onChangeRecipient(newSelectedRecipients, props.type);
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

  const heightResults = React.useMemo(() => {
    //TODO: à dynamiser (nb de résultats * hauteur d'un item + header + offset)
    return filteredUsers.length * 58 + 40 + 100;
  }, [filteredUsers]);

  return (
    <>
      <View
        style={[styles.container, selectedRecipients.length === 0 ? styles.containerEmpty : {}]}
        ref={viewContainerRef}
        /**
         * Pour rappel, je pense que le problème vient du fait qu'il y a une différence entre Android et iOS dans les valeurs retours de measure().
         * Android mesure depuis le parent immédiat (il n'a pas l'air d'en trouver un à ce moment là ou il le trouve mais la view est situé à 0 dans l'espace) alors qu'iOS mesure depuis la root view ou le composant le plus haut.
         * onLayout c'est le petit cousin de feu onComponentDidMount, ça t'assure que les valeurs retournées sont celles calculées après que le render soit fait côté natif.
         */
        onLayout={e => {
          const { height, width, x, y } = e.nativeEvent.layout;
          setContainerLayout({ height, width, x, y });
        }}>
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
              keyboardShouldPersistTaps="always"
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
                const isSelected = selectedRecipients.some(selectedRecipient => selectedRecipient.id === item.id);
                return <Component item={item} onPress={addUser} selected={isSelected} />;
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
