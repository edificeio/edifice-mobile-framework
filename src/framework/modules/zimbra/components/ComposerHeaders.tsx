import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { ISearchUsers } from '~/framework/modules/conversation/service/newMail';

import SearchUserMail from './SearchUserMail';

const styles = StyleSheet.create({
  expandActionContainer: {
    padding: UI_SIZES.spacing.minor,
    marginLeft: UI_SIZES.spacing.minor,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.small,
  },
  subjectInput: {
    flex: 1,
    height: 40,
    marginLeft: UI_SIZES.spacing.minor,
    color: theme.ui.text.regular,
    borderBottomColor: theme.palette.grey.pearl,
    borderBottomWidth: 2,
  },
});

const HeaderUsers = ({
  title,
  onChange,
  value,
  children,
  hasRightToSendExternalMails,
}: React.PropsWithChildren<{
  title: string;
  onChange;
  onSave;
  value: any;
  hasRightToSendExternalMails: boolean;
}>) => {
  return (
    <View style={styles.headerRow}>
      <SmallText>{title} : </SmallText>
      <SearchUserMail
        selectedUsersOrGroups={value}
        onChange={val => onChange(val)}
        hasRightToSendExternalMails={hasRightToSendExternalMails}
      />
      {children}
    </View>
  );
};

const HeaderSubject = ({ onChange, onSave, value }: React.PropsWithChildren<{ onChange; onSave; value: any }>) => {
  const textUpdateTimeout = React.useRef<NodeJS.Timeout>();
  const [currentValue, updateCurrentValue] = React.useState(value);

  React.useEffect(() => {
    clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = setTimeout(() => onChange(currentValue), 500);

    return () => {
      clearTimeout(textUpdateTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  return (
    <View style={styles.headerRow}>
      <SmallText>{I18n.t('zimbra-subject')} : </SmallText>
      <TextInput
        defaultValue={value}
        onChangeText={text => updateCurrentValue(text)}
        onEndEditing={() => onSave()}
        style={styles.subjectInput}
      />
    </View>
  );
};

type MailHeaders = { to: ISearchUsers; cc: ISearchUsers; bcc: ISearchUsers; subject: string };

interface ComposerHeadersProps {
  hasRightToSendExternalMails: boolean;
  headers: MailHeaders;
  onChange: (headers: MailHeaders) => void;
  onSave: () => void;
}

export const ComposerHeaders = ({ hasRightToSendExternalMails, headers, onChange, onSave }: ComposerHeadersProps) => {
  const [isExpanded, setExpanded] = React.useState<boolean>(false);

  const expand = () => setExpanded(!isExpanded);

  return (
    <>
      <HeaderUsers
        title={I18n.t('zimbra-to')}
        value={headers.to}
        onChange={to => onChange({ ...headers, to })}
        onSave={onSave}
        hasRightToSendExternalMails={hasRightToSendExternalMails}>
        <TouchableOpacity onPress={expand} style={styles.expandActionContainer}>
          <Picture
            type="NamedSvg"
            name={isExpanded ? 'ui-rafterUp' : 'ui-rafterDown'}
            width={20}
            height={20}
            fill={theme.ui.text.regular}
          />
        </TouchableOpacity>
      </HeaderUsers>
      {isExpanded ? (
        <>
          <HeaderUsers
            title={I18n.t('zimbra-cc')}
            value={headers.cc}
            onChange={cc => onChange({ ...headers, cc })}
            onSave={onSave}
            hasRightToSendExternalMails={hasRightToSendExternalMails}
          />
          <HeaderUsers
            title={I18n.t('zimbra-bcc')}
            value={headers.bcc}
            onChange={bcc => onChange({ ...headers, bcc })}
            onSave={onSave}
            hasRightToSendExternalMails={hasRightToSendExternalMails}
          />
        </>
      ) : null}
      <HeaderSubject value={headers.subject} onChange={subject => onChange({ ...headers, subject })} onSave={onSave} />
    </>
  );
};
