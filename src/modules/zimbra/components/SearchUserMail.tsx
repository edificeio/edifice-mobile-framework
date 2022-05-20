import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import Toast from 'react-native-tiny-toast';

import { UI_SIZES } from '~/framework/components/constants';
import { Text } from '~/framework/components/text';
import { newMailService } from '~/modules/zimbra/service/newMail';
import { getProfileColor } from '~/modules/zimbra/utils/userColor';
import { CommonStyles, IOSShadowStyle } from '~/styles/common/styles';

const styles = StyleSheet.create({
  foundListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginLeft: 10,
  },
  selectedListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userOrGroupSearchContainer: {
    overflow: 'visible',
    marginHorizontal: 5,
    flex: 1,
  },
});

const Input = ({ value, onChangeText, onSubmit, onBlur }) => {
  const textInputStyle = {
    flex: 1,
    height: 40,
    color: CommonStyles.textColor,
    borderBottomColor: '#EEEEEE',
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
    backgroundColor: 'white',
    elevation: CommonStyles.elevation,
    maxHeight: UI_SIZES.screen.height * 0.25,
    flexGrow: 1,
    ...IOSShadowStyle,
  } as ViewStyle;

  const FoundUserOrGroup = ({ profile, displayName, onPress }) => {
    const [color, setColor] = React.useState(CommonStyles.lightGrey);
    React.useEffect(() => {
      setColor(getProfileColor(profile));
    }, [profile]);

    return (
      <TouchableOpacity style={styles.foundListButton} onPress={onPress}>
        <Text numberOfLines={1} lineHeight={30} ellipsizeMode="tail">
          <Text
            style={{
              color,
            }}>
            {'\u25CF '}
          </Text>
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  return foundUserOrGroup.length > 0 ? (
    <View>
      <FlatList
        style={absoluteListStyle}
        data={foundUserOrGroup}
        renderItem={({ item }) => (
          <FoundUserOrGroup profile={item.profile} displayName={item.name || item.displayName} onPress={() => addUser(item)} />
        )}
      />
    </View>
  ) : (
    <View />
  );
};

const SelectedList = ({ selectedUsersOrGroups, onItemClick }) => {
  const SelectedUserOrGroup = ({ onClick, displayName }) => {
    const itemStyle = {
      backgroundColor: CommonStyles.primaryLight,
      borderRadius: 3,
      padding: 5,
      margin: 2,
    } as ViewStyle;

    const userLabel = { color: CommonStyles.primary, textAlignVertical: 'center' } as ViewStyle;

    return (
      <TouchableOpacity onPress={onClick} style={itemStyle}>
        <Text style={userLabel}>{displayName}</Text>
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
  const hasAtChar = search.includes('@') as boolean;

  const inputValidateAction = (onBlur: boolean = false) => {
    if (!onBlur && !hasAtChar) {
      addUser({ displayName: search, id: search });
    } else if (hasRightToSendExternalMails) {
      hasAtChar && addUser({ displayName: search, id: search });
    } else {
      if (search !== '') {
        updateSearch('');
        Toast.show(I18n.t('zimbra-external-mail-right-error'));
      }
    }
  };

  return (
    <View style={styles.userOrGroupSearchContainer}>
      <SelectedList selectedUsersOrGroups={selectedUsersOrGroups} onItemClick={removeUser} />
      <Input
        value={search}
        onChangeText={updateSearch}
        onSubmit={() => inputValidateAction()}
        onBlur={() => inputValidateAction(true)}
      />
      <FoundList foundUserOrGroup={foundUsersOrGroups} addUser={addUser} />
    </View>
  );
};

export default UserOrGroupSearch;
