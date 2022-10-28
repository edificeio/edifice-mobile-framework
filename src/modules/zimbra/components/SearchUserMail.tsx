import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { newMailService } from '~/modules/zimbra/service/newMail';
import { getProfileColor } from '~/modules/zimbra/utils/userColor';

const styles = StyleSheet.create({
  foundListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: UI_SIZES.spacing.tiny,
    marginLeft: UI_SIZES.spacing.small,
  },
  selectedListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userOrGroupSearchContainer: {
    overflow: 'visible',
    marginHorizontal: UI_SIZES.spacing.tiny,
    flex: 1,
  },
});

const Input = ({ value, onChangeText, onSubmit, onBlur }) => {
  const textInputStyle = {
    flex: 1,
    height: 40,
    color: theme.ui.text.regular,
    borderBottomColor: theme.palette.grey.pearl,
    borderBottomWidth: 2,
  } as ViewStyle;

  return (
    <TextInput
      autoCorrect={false}
      spellCheck={false}
      autoCapitalize="none"
      style={textInputStyle}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      onBlur={onBlur}
    />
  );
};

const FoundList = ({ foundUserOrGroup, addUser }) => {
  const absoluteListStyle = {
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
  } as ViewStyle;

  const FoundUserOrGroup = ({ profile, displayName, onPress }) => {
    const [color, setColor] = React.useState(theme.palette.grey.fog);
    React.useEffect(() => {
      setColor(getProfileColor(profile));
    }, [profile]);

    return (
      <TouchableOpacity style={styles.foundListButton} onPress={onPress}>
        <SmallText style={{ color }}>{'\u25CF '}</SmallText>
        <SmallText numberOfLines={1}>{displayName}</SmallText>
      </TouchableOpacity>
    );
  };

  return foundUserOrGroup.length > 0 ? (
    <FlatList
      style={absoluteListStyle}
      data={foundUserOrGroup}
      renderItem={({ item }) => (
        <FoundUserOrGroup profile={item.profile} displayName={item.name || item.displayName} onPress={() => addUser(item)} />
      )}
      keyboardShouldPersistTaps="handled"
    />
  ) : (
    <View />
  );
};

const SelectedList = ({ selectedUsersOrGroups, onItemClick }) => {
  const SelectedUserOrGroup = ({ onClick, displayName }) => {
    const itemStyle = {
      backgroundColor: theme.palette.primary.pale,
      borderRadius: 3,
      padding: UI_SIZES.spacing.tiny,
      margin: UI_SIZES.spacing.tiny,
    } as ViewStyle;

    const userLabel = { color: theme.palette.primary.regular, textAlignVertical: 'center' } as ViewStyle;

    return (
      <TouchableOpacity onPress={onClick} style={itemStyle}>
        <SmallText style={userLabel}>{displayName}</SmallText>
      </TouchableOpacity>
    );
  };

  return selectedUsersOrGroups.length > 0 ? (
    <View style={styles.selectedListContainer}>
      {selectedUsersOrGroups.map(userOrGroup => (
        <SelectedUserOrGroup
          key={userOrGroup.id}
          onClick={() => onItemClick(userOrGroup.id)}
          displayName={userOrGroup.displayName}
        />
      ))}
    </View>
  ) : (
    <View />
  );
};

const UserOrGroupSearch = ({ selectedUsersOrGroups, onChange, hasRightToSendExternalMails }) => {
  const [search, updateSearch] = React.useState('');
  const [foundUsersOrGroups, updateFoundUsersOrGroups] = React.useState([]);
  const searchTimeout = React.useRef();

  const filterUsersOrGroups = found => selectedUsersOrGroups.every(selected => selected.id !== found.id);
  React.useEffect(() => {
    if (search.length >= 3) {
      updateFoundUsersOrGroups([]);
      window.clearTimeout(searchTimeout.current);
      searchTimeout.current = window.setTimeout(() => {
        newMailService.searchUsers(search).then(({ groups, users }) => {
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
      window.clearTimeout(searchTimeout.current);
    };
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
      return Toast.show(I18n.t('zimbra-external-mail-right-error'), { ...UI_ANIMATIONS.toast });
    }
    if (search !== '') {
      updateSearch('');
    }
  };

  return (
    <View style={styles.userOrGroupSearchContainer}>
      <SelectedList selectedUsersOrGroups={selectedUsersOrGroups} onItemClick={removeUser} />
      <Input value={search} onChangeText={updateSearch} onSubmit={manageExternalRecipient} onBlur={manageExternalRecipient} />
      <FoundList foundUserOrGroup={foundUsersOrGroups} addUser={addUser} />
    </View>
  );
};

export default UserOrGroupSearch;
