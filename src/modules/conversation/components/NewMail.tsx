import I18n from 'i18n-js';
import React, { ReactChild, ReactElement } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TextInput,
  ViewStyle,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  KeyboardAvoidingViewProps,
  Keyboard
} from 'react-native';
import { hasNotch } from 'react-native-device-info';
import { connect } from 'react-redux';

import { PageView } from '../../../framework/components/page';
import { IDistantFileWithId } from '../../../framework/util/fileHandler';
import theme from '../../../framework/util/theme';
import HtmlToText from '../../../infra/htmlConverter/text';
import { CommonStyles } from '../../../styles/common/styles';
import { Icon, Loading } from '../../../ui';
import TouchableOpacity from '../../../ui/CustomTouchableOpacity';
import { HtmlContentView } from '../../../ui/HtmlContentView';
import { Text } from '../../../ui/Typography';
import moduleConfig from '../moduleConfig';
import { ISearchUsers, IUser, newMailService } from '../service/newMail';
import { IVisibleGroup, IVisibles, IVisiblesState, IVisibleUser, searchVisibles } from '../state/visibles';
import Attachment from './Attachment';
import SearchUserMail, { FoundList, Input, SelectedList } from './SearchUserMail';

type HeadersProps = { to: ISearchUsers; cc: ISearchUsers; cci: ISearchUsers; subject: string };

type IAttachment = {
  id?: string;
  filename: string;
  contentType: string;
  size?: number;
};

interface NewMailComponentProps {
  isFetching: boolean;
  headers: HeadersProps;
  onDraftSave: () => void;
  onHeaderChange: (header: HeadersProps) => void;
  body: string;
  onBodyChange: (body: string) => void;
  attachments: IDistantFileWithId[];
  onAttachmentChange: (attachments: IAttachment[]) => void;
  onAttachmentDelete: (attachmentId: string) => void;
  prevBody: any;
  isReplyDraft: boolean;
}

const styles = StyleSheet.create({
  mailPart: {
    padding: 5,
    backgroundColor: 'white',
  },
});

export default (props: NewMailComponentProps) => {
  const [showExtraFields, toggleExtraFields] = React.useState(false);
  const [keyboardStatus, setKeyboardStatus] = React.useState(0); // State used just to force-update the component whenever it changes
  const [isSearchingUsers, toggleIsSearchingUsers] = React.useState({ to: false, cc: false, cci: false });
  const setIsSearchingUsers = (val: { [i in 'to' | 'cc' | 'cci']?: boolean }) => {
    toggleIsSearchingUsers({ ...isSearchingUsers, ...val });
  };
  const isSearchingUsersFinal = Object.values(isSearchingUsers).includes(true);
  // console.log("render components", isSearchingUsers);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardStatus(new Date().getTime());
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  const keyboardAvoidingViewBehavior = Platform.select({
    ios: 'padding',
    android: undefined,
  }) as KeyboardAvoidingViewProps['behavior'];
  // const insets = useSafeAreaInsets();                            // Note : this commented code is the theory
  // const keyboardAvoidingViewVerticalOffset = insets.top + 56;    // But Practice >> Theory. Here, magic values ont the next ligne give better results.
  const keyboardAvoidingViewVerticalOffset = hasNotch() ? 100 : 76; // Those are "magic" values found by try&error. Seems to be fine on every phone.
  return (
    <PageView path="conversation">
      <KeyboardAvoidingView
        behavior={keyboardAvoidingViewBehavior}
        keyboardVerticalOffset={keyboardAvoidingViewVerticalOffset}
        style={{ height: '100%' }}>
        <ScrollView
          contentContainerStyle={
            isSearchingUsersFinal
              ? {
                  flexGrow: 0,
                  flexBasis: '100%',
                }
              : {
                  flexGrow: 1,
                }
          }
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          {...(isSearchingUsers
            ? {
                style: {
                  flexBasis: '100%',
                  flexGrow: 0,
                  flexShrink: 0,
                  maxHeight: '100%',
                },
              }
            : {})}>
          <View style={{ flexGrow: 1 }}>
            {props.isFetching ? (
              <Loading />
            ) : (
              <Fields
                {...props}
                showExtraFields={showExtraFields}
                toggleExtraFields={toggleExtraFields}
                setIsSearchingUsers={setIsSearchingUsers}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageView>
  );
};

const Fields = ({
  headers,
  onHeaderChange,
  showExtraFields,
  toggleExtraFields,
  setIsSearchingUsers,
  attachments,
  onAttachmentChange,
  onAttachmentDelete,
  onDraftSave,
  prevBody,
  isReplyDraft,
  body,
  onBodyChange,
}: {
  headers: HeadersProps;
  onHeaderChange: (header: HeadersProps) => void;
  showExtraFields: boolean;
  toggleExtraFields: (val: boolean) => void;
  setIsSearchingUsers: (val: { [i in 'to' | 'cc' | 'cci']?: boolean }) => void;
  attachments: IDistantFileWithId[];
  onAttachmentChange: (attachments: IAttachment[]) => void;
  onAttachmentDelete: (attachmentId: string) => void;
  onDraftSave: () => void;
  prevBody: any;
  isReplyDraft: boolean;
  body: string;
  onBodyChange: (body: string) => void;
}) => {
  const commonFields = (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.background.card }}>
      <HeaderSubject
        title={I18n.t('conversation.subject')}
        value={headers.subject}
        onChange={subject => onHeaderChange({ ...headers, subject })}
        key="subject"
      />
      <Attachments
        style={{ zIndex: 2 }}
        attachments={attachments}
        onChange={onAttachmentChange}
        onDelete={onAttachmentDelete}
        onSave={onDraftSave}
        key="attachments"
      />
      <Body style={{ zIndex: 1 }} value={body} onChange={onBodyChange} autofocus={isReplyDraft} key="body" />
      {!!prevBody && <PrevBody prevBody={prevBody} key="prevBody" />}
    </SafeAreaView>
  );

  return (
    <MailContactField
      autoFocus={true}
      value={headers.to}
      onChange={to => onHeaderChange({ ...headers, to })}
      rightComponent={
        <TouchableOpacity style={{ paddingVertical: 6 }} onPress={() => toggleExtraFields(!showExtraFields)}>
          <Icon name={showExtraFields ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={28} />
        </TouchableOpacity>
      }
      title={I18n.t('conversation.to')}
      key="to"
      onOpenSearch={v => setIsSearchingUsers({ to: v })}>
      {showExtraFields ? (
        <MailContactField
          title={I18n.t('conversation.cc')}
          value={headers.cc}
          onChange={cc => onHeaderChange({ ...headers, cc })}
          key="cc"
          onOpenSearch={v => setIsSearchingUsers({ cc: v })}>
          <MailContactField
            title={I18n.t('conversation.bcc')}
            value={headers.cci}
            onChange={cci => onHeaderChange({ ...headers, cci })}
            key="cci"
            onOpenSearch={v => setIsSearchingUsers({ cci: v })}>
            {commonFields}
          </MailContactField>
        </MailContactField>
      ) : (
        commonFields
      )}
    </MailContactField>
  );
};

const MailContactField = connect(state => ({
  visibles: state[moduleConfig.reducerName].visibles as IVisiblesState
}))(({
  style,
  title,
  value,
  onChange,
  children,
  autoFocus,
  rightComponent,
  onOpenSearch,
  visibles
}: {
  style?: ViewStyle;
  title: string;
  value?: IUser[];
  onChange?: (value: IUser[]) => void;
  children?: ReactChild;
  autoFocus?: boolean;
  rightComponent?: ReactElement;
  onOpenSearch?: (searchIsOpen: boolean) => void;
  visibles: IVisiblesState
}) => {
  const selectedUsersOrGroups = value || [];
  const [search, updateSearch] = React.useState('');
  const previousVisibles = React.useRef<IVisiblesState>();
  const [foundUsersOrGroups, updateFoundUsersOrGroups] = React.useState<Array<IVisibleUser | IVisibleGroup>>([]);
  const searchTimeout = React.useRef();

  // Update search results whenever visibles are loaded
  React.useEffect(() => {
    // console.log("useEffet", previousVisibles.current?.lastSuccess?.toString(), visibles.lastSuccess?.toString());
    previousVisibles.current = visibles;
    if (previousVisibles.current.lastSuccess && visibles.lastSuccess && !previousVisibles.current.lastSuccess.isSame(visibles.lastSuccess)) {
      onUserType(search);
    }
  });

  const filterUsersOrGroups = found => selectedUsersOrGroups.every(selected => selected.id !== found.id);
  // React.useEffect(() => {
  //   if (search.length >= 3) {
  //     updateFoundUsersOrGroups([]);
  //     console.log("openOpenSearch", true);
  //     onOpenSearch?.(true);
  //     window.clearTimeout(searchTimeout.current);
  //     searchTimeout.current = window.setTimeout(() => {
  //       newMailService.searchUsers(search).then(({ groups, users }) => {
  //         const filteredUsers = users.filter(filterUsersOrGroups);
  //         const filteredGroups = groups.filter(filterUsersOrGroups);
  //         updateFoundUsersOrGroups([...filteredUsers, ...filteredGroups]);
  //       });
  //     }, 500);
  //   }

  //   return () => {
  //     updateFoundUsersOrGroups([]);
  //     onOpenSearch?.(false);
  //     console.log("openOpenSearch", false);
  //     window.clearTimeout(searchTimeout.current);
  //   };
  // }, [search]);

  const removeUser = (id: string) => onChange?.(selectedUsersOrGroups.filter(user => user.id !== id));
  const addUser = userOrGroup => {
    onChange?.([
      ...selectedUsersOrGroups,
      { displayName: userOrGroup.name || userOrGroup.displayName, id: userOrGroup.id } as IUser,
    ]);
    onUserType('');
  };

  const onUserType = (s: string) => {
    updateSearch(s);
    if (s.length >= 3) {
      updateFoundUsersOrGroups([]);
      // console.log("openOpenSearch", true);
      onOpenSearch?.(true);
      searchTimeout.current && window.clearTimeout(searchTimeout.current);
      searchTimeout.current = window.setTimeout(() => {
        // This commented area is the old searching method that query the backend
        // newMailService.searchUsers(search).then(({ groups, users }) => {
        //   const filteredUsers = users.filter(filterUsersOrGroups);
        //   const filteredGroups = groups.filter(filterUsersOrGroups);
        //   updateFoundUsersOrGroups([...filteredUsers, ...filteredGroups]);
        // });
        const searchResults = visibles.lastSuccess ? searchVisibles(visibles.data, s, value) : [];
        updateFoundUsersOrGroups(searchResults);
      }, 500);
    } else {
      updateFoundUsersOrGroups([]);
      onOpenSearch?.(false);
      // console.log("openOpenSearch", false);
      window.clearTimeout(searchTimeout.current);
    }
  };

  const inputStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 2,
    backgroundColor: theme.color.background.card,
    flex: 0,
  } as ViewStyle;
  return (
    <View style={{ flexGrow: 1 }}>
      <View style={{ flex: 0, alignItems: 'stretch' }}>
        <View style={[inputStyle, style]}>
          <Text style={{ color: CommonStyles.lightTextColor, paddingVertical: 10 }}>{title} : </Text>
          <View style={{ overflow: 'visible', marginHorizontal: 5, flex: 1 }}>
            <SelectedList selectedUsersOrGroups={selectedUsersOrGroups} onItemClick={removeUser} />
            <Input
              autoFocus={autoFocus}
              value={search}
              onChangeText={onUserType}
              onSubmit={() => addUser({ displayName: search, id: search })}
            />
          </View>
          {rightComponent}
        </View>
      </View>
      <View style={{ flexGrow: 1 }}>
        {foundUsersOrGroups.length ? <FoundList foundUserOrGroup={foundUsersOrGroups} addUser={addUser} /> : children}
      </View>
    </View>
  );
});

const HeaderUsers = ({
  style,
  title,
  onChange,
  value,
  children,
  autoFocus,
}: React.PropsWithChildren<{
  autoFocus?: boolean;
  style?: ViewStyle;
  title: string;
  onChange;
  forUsers?: boolean;
  value: any;
}>) => {
  const headerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 2,
  } as ViewStyle;

  return (
    <View style={[headerStyle, style]}>
      <Text style={{ color: CommonStyles.lightTextColor }}>{title} : </Text>
      <SearchUserMail selectedUsersOrGroups={value} onChange={val => onChange(val)} autoFocus={autoFocus} />
      {children}
    </View>
  );
};

const HeaderSubject = ({
  style,
  title,
  onChange,
  value,
}: React.PropsWithChildren<{ style?: ViewStyle; title: string; onChange; forUsers?: boolean; value: any }>) => {
  const headerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 2,
    backgroundColor: theme.color.background.card,
  } as ViewStyle;

  const inputStyle = {
    flex: 1,
    height: 40,
    color: CommonStyles.textColor,
  } as ViewStyle;

  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState(value);

  React.useEffect(() => {
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => onChange(currentValue), 500);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentValue]);

  return (
    <View style={[headerStyle, style]}>
      <Text style={{ color: CommonStyles.lightTextColor }}>{title} : </Text>
      <TextInput style={inputStyle} defaultValue={value} numberOfLines={1} onChangeText={text => updateCurrentValue(text)} />
    </View>
  );
};

const Headers = ({ style, headers, onChange, autofocus }) => {
  const [showExtraFields, toggleExtraFields] = React.useState(false);
  const { to, cc, cci, subject } = headers;

  return (
    <View style={[styles.mailPart, style]}>
      <HeaderUsers
        autoFocus={autofocus}
        style={{ zIndex: 4 }}
        value={to}
        onChange={to => onChange({ ...headers, to })}
        title={I18n.t('conversation.to')}>
        <TouchableOpacity onPress={() => toggleExtraFields(!showExtraFields)}>
          <Icon name={showExtraFields ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={28} />
        </TouchableOpacity>
      </HeaderUsers>
      {showExtraFields && (
        <>
          <HeaderUsers
            style={{ zIndex: 3 }}
            title={I18n.t('conversation.cc')}
            value={cc}
            onChange={cc => onChange({ ...headers, cc })}
          />
          <HeaderUsers
            style={{ zIndex: 2 }}
            title={I18n.t('conversation.bcc')}
            value={cci}
            onChange={cci => onChange({ ...headers, cci })}
          />
        </>
      )}
      <HeaderSubject
        title={I18n.t('conversation.subject')}
        value={subject}
        onChange={subject => onChange({ ...headers, subject })}
      />
    </View>
  );
};

const Attachments = ({
  style,
  attachments,
  onChange,
  onDelete,
  onSave,
}: {
  style;
  attachments: IDistantFileWithId[];
  onChange;
  onDelete;
  onSave;
}) => {
  const removeAttachment = id => {
    const newAttachments = attachments.filter(item => item.id !== id);
    onDelete(id);
    onChange(newAttachments);
  };

  return attachments.length === 0 ? (
    <View />
  ) : (
    <View style={[styles.mailPart, style, { padding: 0 }]}>
      {attachments.map(att => (
        <Attachment
          id={att.id || att.filename}
          uploadSuccess={!!att.id && onSave()}
          fileType={att.filetype}
          fileName={att.filename}
          onRemove={() => removeAttachment(att.id)}
        />
      ))}
    </View>
  );
};

const Body = ({ style, value, onChange, autofocus }) => {
  const textUpdateTimeout = React.useRef();
  // const removeWrapper = (text: string) => {
  //   return text.replace(/^<div class="ng-scope mobile-application-wrapper">(.*)/, '$1').replace(/(.*)<\/div>$/, '$1');
  // }
  const br2nl = (text: string) => {
    return text?.replace(/<br\/?>/gm, '\n').replace(/<div>\s*?<\/div>/gm, '\n');
  };
  const nl2br = (text: string) => {
    return text?.replace(/\n/gm, '<br>');
  };
  // console.log("value", nl2br(value));
  const valueFormated = HtmlToText(nl2br(value), false).render;
  const [currentValue, updateCurrentValue] = React.useState(valueFormated);

  React.useEffect(() => {
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => onChange(currentValue), 500);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentValue]);

  return (
    <View style={[styles.mailPart, style, { flexGrow: 1 }]}>
      <TextInput
        autoFocus={autofocus}
        placeholder={I18n.t('conversation.typeMessage')}
        textAlignVertical="top"
        multiline
        scrollEnabled={false}
        style={{ flexGrow: 1 }}
        defaultValue={value}
        value={br2nl(currentValue)}
        onChangeText={text => updateCurrentValue(nl2br(text))}
      />
    </View>
  );
};

const PrevBody = ({ prevBody }) => {
  return (
    <View style={[styles.mailPart, { flexGrow: 1 }]}>
      <HtmlContentView html={prevBody} />
    </View>
  );
};
