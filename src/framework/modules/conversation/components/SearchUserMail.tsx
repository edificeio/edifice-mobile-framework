import * as React from 'react';
import { FlatList, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '~/app/theme';
import { UI_SIZES, getScaleFontSize } from '~/framework/components/constants';
import { Icon } from '~/framework/components/icon';
import { SmallText, TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import { newMailService } from '~/framework/modules/conversation/service/newMail';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

export const FoundList = ({ foundUserOrGroup, addUser }) => {
  const insets = useSafeAreaInsets();
  const absoluteListStyle = {
    backgroundColor: theme.ui.background.card,
    flex: 1,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  } as ViewStyle;

  const FoundUserOrGroup = ({ id, displayName, onPress }) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: UI_SIZES.spacing.minor,
          marginLeft: UI_SIZES.spacing.minor,
        }}
        onPress={onPress}>
        <SingleAvatar userId={id} />
        <SmallText numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, marginLeft: UI_SIZES.spacing.small }}>
          {displayName}
        </SmallText>
      </TouchableOpacity>
    );
  };

  return foundUserOrGroup.length > 0 ? (
    <FlatList
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag"
      removeClippedSubviews
      nestedScrollEnabled
      contentContainerStyle={{
        paddingBottom: insets.bottom,
      }}
      style={absoluteListStyle}
      data={foundUserOrGroup}
      renderItem={({ item }) => (
        <FoundUserOrGroup
          id={item.id}
          displayName={item.name || item.displayName}
          onPress={() => {
            addUser(item);
          }}
        />
      )}
    />
  ) : (
    <View />
  );
};

export const Input = ({ value, onChangeText, onSubmit, autoFocus, inputRef, key, onEndEditing = () => {} }) => {
  const textInputStyle = {
    ...TextFontStyle.Regular,
    ...TextSizeStyle.Normal,
    lineHeight: undefined,
    flex: 0,
    paddingVertical: UI_SIZES.spacing.tiny,
    color: theme.ui.text.regular,
    marginVertical: 2, // Hack to compensate the position of TextInput baseline compared to regular text.
    height: getScaleFontSize(20) * 1.5, // Some magic here.
  } as ViewStyle;

  return (
    <TextInput
      key={key}
      ref={ref => {
        if (ref) {
          inputRef.current = ref;
        }
      }}
      autoFocus={autoFocus}
      autoCorrect={false}
      spellCheck={false}
      autoCapitalize="none"
      style={textInputStyle}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      onEndEditing={onEndEditing}
    />
  );
};

//Selected Item

export const SelectedList = ({ selectedUsersOrGroups, onItemClick }) => {
  const SelectedUserOrGroup = ({ onClick, displayName }) => {
    const itemStyle = {
      backgroundColor: theme.palette.complementary.blue.pale,
      borderRadius: 3,
      paddingVertical: UI_SIZES.spacing.tiny,
      paddingHorizontal: UI_SIZES.spacing.tiny,
      marginRight: UI_SIZES.spacing.tiny,
      flex: 0,
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle;

    const userLabel = { color: theme.palette.complementary.blue.regular, textAlignVertical: 'center' } as ViewStyle;

    return (
      <TouchableOpacity onPress={onClick} style={itemStyle}>
        <SmallText style={userLabel}>{displayName}</SmallText>
        <Icon
          name="close"
          size={12}
          color={theme.palette.complementary.blue.regular}
          style={{ marginLeft: UI_SIZES.spacing.minor }}
        />
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

export const UserOrGroupSearch = ({ selectedUsersOrGroups, onChange, autoFocus }) => {
  const [search, updateSearch] = React.useState('');
  const [foundUsersOrGroups, updateFoundUsersOrGroups] = React.useState([]);
  const searchTimeout = React.useRef();

  React.useEffect(() => {
    const filterUsersOrGroups = found => selectedUsersOrGroups?.every(selected => selected.id !== found.id);
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
  }, [filterUsersOrGroups, search]);

  const removeUser = id => onChange(selectedUsersOrGroups?.filter(user => user.id !== id) || []);
  const addUser = userOrGroup => {
    onChange([...selectedUsersOrGroups, { displayName: userOrGroup.name || userOrGroup.displayName, id: userOrGroup.id }]);
    updateSearch('');
  };

  return (
    <View
      style={{
        overflow: 'visible',
        marginHorizontal: UI_SIZES.spacing.minor,
        flex: 1,
      }}>
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

export default UserOrGroupSearch;
