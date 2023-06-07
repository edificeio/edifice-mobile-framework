import * as React from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallActionText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import { IRecipient } from '~/framework/modules/zimbra/model';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { getProfileColor } from '~/framework/modules/zimbra/utils/userColor';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.minor,
  },
  foundRecipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: UI_SIZES.spacing.tiny,
    marginLeft: UI_SIZES.spacing.small,
  },
  foundRecipientListContainer: {
    top: 0,
    left: 0,
    right: 0,
    flexGrow: 1,
    zIndex: 10,
    width: '100%',
    maxHeight: UI_SIZES.screen.height * 0.25,
    backgroundColor: theme.ui.background.card,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 5,
  },
  selectedRecipientContainer: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: 3,
    padding: UI_SIZES.spacing.tiny,
    margin: UI_SIZES.spacing.tiny,
  },
  selectedRecipientListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  textInput: {
    flex: 1,
    height: 40,
    color: theme.ui.text.regular,
    borderBottomColor: theme.palette.grey.pearl,
    borderBottomWidth: 2,
  },
});

interface RecipientFieldProps {
  hasZimbraSendExternalRight: boolean;
  selectedRecipients: IRecipient[];
  onChange: (recipients: IRecipient[]) => void;
}

export const RecipientField = ({ hasZimbraSendExternalRight, selectedRecipients, onChange }: RecipientFieldProps) => {
  const [value, setValue] = React.useState<string>('');
  const [foundRecipients, setFoundRecipients] = React.useState<IRecipient[]>([]);
  const searchTimeout = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const session = getSession();
    if (value.length > 2) {
      setFoundRecipients([]);
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        if (!session) return;
        const selectedIds = selectedRecipients.map(recipient => recipient.id);
        zimbraService.recipients
          .search(session, value)
          .then(recipients => setFoundRecipients(recipients.filter(recipient => !selectedIds.includes(recipient.id))));
      }, 500);
    }
    return () => {
      setFoundRecipients([]);
      clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const addRecipient = (recipient: IRecipient) => {
    onChange([...selectedRecipients, recipient]);
    setValue('');
  };

  const removeRecipient = (id: string) => onChange(selectedRecipients.filter(recipient => recipient.id !== id));

  const manageExternalRecipient = () => {
    if (value.includes('@')) {
      if (hasZimbraSendExternalRight) {
        addRecipient({ id: value, displayName: value } as IRecipient);
      } else {
        Toast.showError(I18n.get('zimbra-composerscreen-recipientfield-externalrighterror'));
      }
    }
    if (value) setValue('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.selectedRecipientListContainer}>
        {selectedRecipients.map(recipient => (
          <TouchableOpacity
            key={recipient.id}
            onPress={() => removeRecipient(recipient.id)}
            style={styles.selectedRecipientContainer}>
            <SmallActionText>{recipient.displayName}</SmallActionText>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        value={value}
        onChangeText={text => setValue(text)}
        onSubmitEditing={manageExternalRecipient}
        onBlur={manageExternalRecipient}
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="none"
        style={styles.textInput}
      />
      <FlatList
        data={foundRecipients}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => addRecipient(item)} style={styles.foundRecipientContainer}>
            <SmallText style={{ color: getProfileColor(item.profile) }}>{'\u25CF '}</SmallText>
            <SmallText numberOfLines={1}>{item.displayName}</SmallText>
          </TouchableOpacity>
        )}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        persistentScrollbar
        style={styles.foundRecipientListContainer}
      />
    </View>
  );
};
