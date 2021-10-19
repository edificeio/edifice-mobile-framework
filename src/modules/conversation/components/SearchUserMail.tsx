import * as React from 'react';
import { TextInput, View, ViewStyle } from 'react-native';
import { TouchableOpacity, FlatList } from 'react-native-gesture-handler';

import { CommonStyles, IOSShadowStyle } from '../../../styles/common/styles';
import { SingleAvatar } from '../../../ui/avatars/SingleAvatar';
import { Text } from '../../../framework/components/text';
import { newMailService } from '../service/newMail';
import theme from '../../../framework/util/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const UserOrGroupSearch = ({ selectedUsersOrGroups, onChange, autoFocus }) => {
  const [search, updateSearch] = React.useState('');
  const [foundUsersOrGroups, updateFoundUsersOrGroups] = React.useState([]);
  const searchTimeout = React.useRef();

  const filterUsersOrGroups = found => selectedUsersOrGroups?.every(selected => selected.id !== found.id);
  React.useEffect(() => {
    if (search.length >= 3) {
      updateFoundUsersOrGroups([]);
      window.clearTimeout(searchTimeout.current);
      searchTimeout.current = window.setTimeout(() => {
        newMailService.searchUsers(search).then(({ groups, users }) => {
          const filteredUsers = users?.filter(filterUsersOrGroups) || [];
          const filteredGroups = groups?.filter(filterUsersOrGroups) || [];
          updateFoundUsersOrGroups([...filteredUsers, ...filteredGroups]);
        });
      }, 500);
    }

    return () => {
      updateFoundUsersOrGroups([]);
      window.clearTimeout(searchTimeout.current);
    };
  }, [search]);

  const removeUser = id => onChange(selectedUsersOrGroups?.filter(user => user.id !== id) || []);
  const addUser = userOrGroup => {
    onChange([...selectedUsersOrGroups, { displayName: userOrGroup.name || userOrGroup.displayName, id: userOrGroup.id }]);
    updateSearch('');
  };

  return (
    <View style={{ overflow: 'visible', marginHorizontal: 5, flex: 1 }}>
      <SelectedList selectedUsersOrGroups={selectedUsersOrGroups} onItemClick={removeUser} />
      <Input
        autoFocus={autoFocus}
        value={search}
        onChangeText={updateSearch}
        onSubmit={() => addUser({ displayName: search, id: search })}
      />
      <FoundList foundUserOrGroup={foundUsersOrGroups} addUser={addUser} />
    </View>
  );
};

export const Input = ({ value, onChangeText, onSubmit, autoFocus }) => {
  const textInputStyle = {
    flex: 0,
    height: 40,
    color: CommonStyles.textColor,
  } as ViewStyle;

  return (
    <TextInput
      autoFocus={autoFocus}
      autoCorrect={false}
      autoCapitalize="none"
      style={textInputStyle}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
    />
  );
};

export const FoundList = ({ foundUserOrGroup, addUser }) => {
  const insets = useSafeAreaInsets();
  const absoluteListStyle = {
    backgroundColor: theme.color.background.card,
    flex: 1,
    ...IOSShadowStyle,
  } as ViewStyle;

  const FoundUserOrGroup = ({ id, displayName, onPress }) => {
    return (
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, marginLeft: 10 }} onPress={onPress}>
        <SingleAvatar userId={id} />
        <Text numberOfLines={1} lineHeight={30} ellipsizeMode="tail" style={{ flex: 1, marginLeft: 10 }}>
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  return foundUserOrGroup.length > 0 ? (
    <FlatList
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      removeClippedSubviews={true}
      contentContainerStyle={{
        paddingBottom: insets.bottom,
      }}
      style={absoluteListStyle}
      data={foundUserOrGroup}
      renderItem={({ item }) => (
        <FoundUserOrGroup id={item.id} displayName={item.name || item.displayName} onPress={() => {addUser(item)}} />
      )}
    />
  ) : (
    <View />
  );
};

//Selected Item

export const SelectedList = ({ selectedUsersOrGroups, onItemClick }) => {
  const SelectedUserOrGroup = ({ onClick, displayName }) => {
    const itemStyle = {
      backgroundColor: CommonStyles.primaryLight,
      borderRadius: 3,
      padding: 5,
      margin: 2,
      flex: 0,
    } as ViewStyle;

    const userLabel = { color: CommonStyles.primary, textAlignVertical: 'center' } as ViewStyle;

    return (
      <TouchableOpacity onPress={onClick} style={itemStyle}>
        <Text style={userLabel}>{displayName}</Text>
      </TouchableOpacity>
    );
  };

  return selectedUsersOrGroups.length > 0 ? (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 0 }}>
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

export default UserOrGroupSearch;
