import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { IRecipient } from '~/framework/modules/zimbra/model';

import { RecipientField } from './RecipientField';

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
  recipients,
  hasRightToSendExternalMails,
  onChange,
  children,
}: React.PropsWithChildren<{
  title: string;
  recipients: IRecipient[];
  hasRightToSendExternalMails: boolean;
  onChange;
}>) => {
  return (
    <View style={styles.headerRow}>
      <SmallText>{title} : </SmallText>
      <RecipientField
        hasRightToSendExternalMails={hasRightToSendExternalMails}
        selectedRecipients={recipients}
        onChange={value => onChange(value)}
      />
      {children}
    </View>
  );
};

type MailHeaders = { to: IRecipient[]; cc: IRecipient[]; bcc: IRecipient[]; subject: string };

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
        recipients={headers.to}
        onChange={to => onChange({ ...headers, to })}
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
            recipients={headers.cc}
            onChange={cc => onChange({ ...headers, cc })}
            hasRightToSendExternalMails={hasRightToSendExternalMails}
          />
          <HeaderUsers
            title={I18n.t('zimbra-bcc')}
            recipients={headers.bcc}
            onChange={bcc => onChange({ ...headers, bcc })}
            hasRightToSendExternalMails={hasRightToSendExternalMails}
          />
        </>
      ) : null}
      <View style={styles.headerRow}>
        <SmallText>{I18n.t('zimbra-subject')} : </SmallText>
        <TextInput
          defaultValue={headers.subject}
          onChangeText={text => onChange({ ...headers, subject: text })}
          onEndEditing={onSave}
          style={styles.subjectInput}
        />
      </View>
    </>
  );
};
