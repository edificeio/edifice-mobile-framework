import * as React from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/icon';
import { SmallText, TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import { newMailService } from '~/framework/modules/conversation/service/newMail';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

//FIXME: create/move to styles.ts
const styles = StyleSheet.create({
  displayName: { flex: 1, marginLeft: UI_SIZES.spacing.small },
  foundUserOrGroupContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.minor,
  },
  selectedListContainer: { flex: 0, flexDirection: 'row', flexWrap: 'wrap' },
  userOrGroupSearch: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
    overflow: 'visible',
  },
});

const FoundUserOrGroup = ({ displayName, id, onPress }) => {
  return (
    <TouchableOpacity style={styles.foundUserOrGroupContainer} onPress={onPress}>
      <SingleAvatar size={undefined} status={undefined} userId={id} />
      <SmallText numberOfLines={1} ellipsizeMode="tail" style={styles.displayName}>
        {displayName}
      </SmallText>
    </TouchableOpacity>
  );
};

export const FoundList = ({ addUser, foundUserOrGroup }) => {
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

export const Input = ({ autoFocus, inputRef, key, onChangeText, onEndEditing = () => {}, onSubmit, value }) => {
  const textInputStyle = {
    ...TextFontStyle.Regular,
    ...TextSizeStyle.Normal,
    color: theme.ui.text.regular,
    flex: 0,
    // Hack to compensate the position of TextInput baseline compared to regular text.
    height: getScaleFontSize(20) * 1.5,

    lineHeight: undefined,

    marginVertical: 2,
    paddingVertical: UI_SIZES.spacing.tiny, // Some magic here.
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

const SelectedUserOrGroup = ({ displayName, onClick }) => {
  const itemStyle = {
    alignItems: 'center',
    backgroundColor: theme.palette.complementary.blue.pale,
    borderRadius: 3,
    flex: 0,
    flexDirection: 'row',
    marginRight: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: UI_SIZES.spacing.tiny,
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
export const SelectedList = ({ onItemClick, selectedUsersOrGroups }) => {
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

export const UserOrGroupSearch = ({ autoFocus, onChange, selectedUsersOrGroups }) => {
  const [search, updateSearch] = React.useState('');
  const [foundUsersOrGroups, updateFoundUsersOrGroups] = React.useState<any[]>([]);
  const searchTimeout = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const filterUsersOrGroups = found => selectedUsersOrGroups?.every(selected => selected.id !== found.id);
    if (search.length >= 3) {
      updateFoundUsersOrGroups([]);
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        newMailService.searchUsers(search).then(({ groups, users }) => {
          const filteredUsers = users?.filter(filterUsersOrGroups) || [];
          const filteredGroups = groups?.filter(filterUsersOrGroups) || [];
          updateFoundUsersOrGroups([...filteredUsers, ...filteredGroups]);
        });
      }, 500);
    }

    return () => {
      updateFoundUsersOrGroups([]);
      clearTimeout(searchTimeout.current);
    };
  }, [search, selectedUsersOrGroups]);

  const removeUser = id => onChange(selectedUsersOrGroups?.filter(user => user.id !== id) || []);
  const addUser = userOrGroup => {
    onChange([...selectedUsersOrGroups, { displayName: userOrGroup.name || userOrGroup.displayName, id: userOrGroup.id }]);
    updateSearch('');
  };

  return (
    <View style={styles.userOrGroupSearch}>
      <SelectedList selectedUsersOrGroups={selectedUsersOrGroups} onItemClick={removeUser} />
      <Input
        key={1}
        inputRef={undefined}
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
