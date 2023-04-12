import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { getProfileColor } from '~/framework/modules/zimbra/utils/userColor';

const styles = StyleSheet.create({
  absoluteList: {
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 10,
    backgroundColor: theme.ui.background.card,
    elevation: 20,
    maxHeight: UI_SIZES.screen.height * 0.25,
    flexGrow: 1,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
  },
  foundListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: UI_SIZES.spacing.tiny,
    marginLeft: UI_SIZES.spacing.small,
  },
  selectedItem: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: 3,
    padding: UI_SIZES.spacing.tiny,
    margin: UI_SIZES.spacing.tiny,
  },
  selectedListContainer: {
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
  userLabel: {
    color: theme.palette.primary.regular,
    textAlignVertical: 'center',
  },
  userOrGroupSearchContainer: {
    overflow: 'visible',
    marginLeft: UI_SIZES.spacing.minor,
    flex: 1,
  },
});

const UserOrGroupSearch = ({ selectedUsersOrGroups, onChange, hasRightToSendExternalMails }) => {
  const [search, updateSearch] = React.useState('');
  const [foundUsersOrGroups, updateFoundUsersOrGroups] = React.useState([]);
  const searchTimeout = React.useRef<NodeJS.Timeout>();

  const filterUsersOrGroups = found => selectedUsersOrGroups.every(selected => selected.id !== found.id);
  React.useEffect(() => {
    const session = getSession();
    if (search.length >= 3) {
      updateFoundUsersOrGroups([]);
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        if (!session) return;
        zimbraService.recipients.search(session, search).then(({ groups, users }) => {
          const filteredUsers = users.filter(filterUsersOrGroups);
          const filteredGroups = groups
            .filter(filterUsersOrGroups)
            .filter(group => group.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
          updateFoundUsersOrGroups([...filteredUsers, ...filteredGroups]);
        });
      }, 500);
    }

    return () => {
      updateFoundUsersOrGroups([]);
      clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const removeUser = id => onChange(selectedUsersOrGroups.filter(user => user.id !== id));

  const addUser = userOrGroup => {
    onChange([...selectedUsersOrGroups, { displayName: userOrGroup.name || userOrGroup.displayName, id: userOrGroup.id }]);
    updateSearch('');
  };

  const manageExternalRecipient = () => {
    if (search.includes('@') && hasRightToSendExternalMails) {
      addUser({ displayName: search, id: search });
    } else if (search.includes('@') && !hasRightToSendExternalMails) {
      updateSearch('');
      return Toast.showError(I18n.t('zimbra-external-mail-right-error'));
    }
    if (search !== '') {
      updateSearch('');
    }
  };

  return (
    <View style={styles.userOrGroupSearchContainer}>
      {selectedUsersOrGroups.length > 0 ? (
        <View style={styles.selectedListContainer}>
          {selectedUsersOrGroups.map(userOrGroup => (
            <TouchableOpacity onPress={() => removeUser(userOrGroup.id)} style={styles.selectedItem}>
              <SmallText style={styles.userLabel}>{userOrGroup.displayName}</SmallText>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      <TextInput
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="none"
        style={styles.textInput}
        value={search}
        onChangeText={updateSearch}
        onSubmitEditing={manageExternalRecipient}
        onBlur={manageExternalRecipient}
      />
      {foundUsersOrGroups.length ? (
        <FlatList
          data={foundUsersOrGroups}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.foundListButton} onPress={() => addUser(item)}>
              <SmallText style={{ color: getProfileColor(item.profile) }}>{'\u25CF '}</SmallText>
              <SmallText numberOfLines={1}>{item.name ?? item.displayName}</SmallText>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          style={styles.absoluteList}
        />
      ) : null}
    </View>
  );
};

export default UserOrGroupSearch;
