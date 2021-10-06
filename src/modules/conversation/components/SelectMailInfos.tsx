import * as React from 'react';
import {
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { hasNotch } from 'react-native-device-info';

import { CommonStyles } from '../../../styles/common/styles';
import TouchableOpacity from '../../../ui/CustomTouchableOpacity';
import { removeAccents } from '../../../framework/util/string';
import { IUser } from '../service/newMail';

const styles = StyleSheet.create({
  userLabel: { color: CommonStyles.primary, textAlignVertical: 'center' },
  scrollField: { maxHeight: 181, flexGrow: 0 },
  fieldContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 17,
  },
  fieldName: {
    textAlignVertical: 'center',
    marginRight: 5,
    marginVertical: 5,
    marginHorizontal: 3,
    color: CommonStyles.lightTextColor,
  },
  textInput: {
    flex: 1,
    height: 40,
    color: CommonStyles.textColor,
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 2,
  },
  shadow: {
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
});

export const rolesDotColor = role => {
  switch (role) {
    case 'Student':
      return CommonStyles.profileTypes.Student;
    case 'Relative':
      return CommonStyles.profileTypes.Relative;
    case 'Teacher':
      return CommonStyles.profileTypes.Teacher;
    case 'Personel':
      return CommonStyles.profileTypes.Personnel;
    case 'PrincTeacherGroup':
      return '#8C939E';
    case 'Guest':
      return CommonStyles.profileTypes.Guest;
    default:
      return 'white';
  }
};

const UserLine = ({ id, displayName, name, checked, onPick, onUnpick, isGroup, profile }) => (
  <TouchableOpacity onPress={() => (!checked ? onPick() : onUnpick())}>
    <Text style={{ flexDirection: 'row', alignItems: 'center', height: 40, marginLeft: 10 }} numberOfLines={1}>
      <Text
        style={{
          color: rolesDotColor(profile),
          fontSize: 20,
        }}>
        {'\u25CF '}
      </Text>
      {name || displayName}
    </Text>
  </TouchableOpacity>
);

export function UserList(props: {
  users: IUser[];
  selectable: boolean;
  onPickUser?: (user: IUser) => void;
  onUnpickUser?: (user: IUser) => void;
  onEndReached?: () => void;
}) {
  return (
    <FlatList
      keyboardShouldPersistTaps="always"
      style={[styles.shadow, { flex: 1, borderTopColor: '#EEEEEE', borderTopWidth: 1 }]}
      data={props.users}
      keyExtractor={(user: IUser) => user.id} //increment in next line
      renderItem={user => (
        <UserLine
          onPick={() => props.onPickUser && props.onPickUser(user.item)}
          onUnpick={() => props.onUnpickUser && props.onUnpickUser(user.item)}
          {...user.item}
        />
      )}
      onEndReached={() => props.onEndReached && props.onEndReached()}
      refreshing
    />
  );
}

export default class SelectMailInfos extends React.Component<
  { remainingUsers; pickedUsers; onPickUser; onUnpickUser; onHandleInputChange; inputName },
  { searchText: string; subjectText: string; max: number }
> {
  state = { searchText: '', subjectText: '', max: 20 };
  input: any;

  public inputRef: any;

  public isMatch = visible =>
    (visible.name &&
      removeAccents(visible.name.toLowerCase()).indexOf(removeAccents(this.state.searchText.toLowerCase())) !== -1) ||
    (visible.displayName &&
      removeAccents(visible.displayName.toLowerCase()).indexOf(removeAccents(this.state.searchText.toLowerCase())) !== -1);

  public expand() {
    const { max } = this.state;
    this.setState({ max: max + 20 });
  }

  get usersArray(): IUser[] {
    const { remainingUsers } = this.props;
    return [...remainingUsers?.filter(v => this.state.searchText && this.isMatch(v)).slice(0, this.state.max)];
  }

  public pickUser = (user: IUser) => {
    const { onPickUser } = this.props;
    onPickUser(user);
    this.setState({ searchText: '' });
  };

  public addExternalUser = (user: string) => {
    const { onPickUser } = this.props;
    if (user !== '' && user !== ' ') onPickUser(user);
    this.setState({ searchText: '' });
  };

  public render() {
    const { searchText } = this.state;
    const { onUnpickUser, pickedUsers, onHandleInputChange, inputName } = this.props;
    let index = 0;
    return (
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            enabled
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? (hasNotch() ? 100 : 76) : undefined}>
            <ScrollView
              alwaysBounceVertical={false}
              style={[styles.scrollField, { backgroundColor: '#FFFFFF' }]}
              ref={r => (this.inputRef = (r as any)?.innerComponent)}>
              <View style={styles.fieldContainer}>
                {pickedUsers &&
                  pickedUsers.length > 0 &&
                  pickedUsers.map(p => (
                    <TouchableOpacity
                      key={'Touchable_' + index++}
                      onPress={() => onUnpickUser(p)}
                      style={{
                        backgroundColor: CommonStyles.primaryLight,
                        borderRadius: 3,
                        padding: 5,
                        maxWidth: '100%',
                        marginHorizontal: 3,
                        marginVertical: 5,
                      }}>
                      {typeof p === 'string' ? (
                        <Text style={styles.userLabel} numberOfLines={2}>
                          {p}
                        </Text>
                      ) : (
                        <Text style={styles.userLabel} numberOfLines={2}>
                          {p.name || p.displayName}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                <TextInput
                  ref={r => (this.input = r)}
                  style={styles.textInput}
                  value={searchText}
                  onChangeText={text => {
                    onHandleInputChange(text, inputName);
                    this.setState({ searchText: text });
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    searchText.length === 0 && nativeEvent.key === 'Backspace' && onUnpickUser(pickedUsers[pickedUsers.length - 1]);
                  }}
                  onSubmitEditing={e => this.addExternalUser(e.nativeEvent.text)}
                />
              </View>
            </ScrollView>

            {this.usersArray.length > 0 ? (
              <ScrollView
                keyboardShouldPersistTaps="always"
                alwaysBounceVertical={false}
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ marginLeft: 40 }}>
                <UserList
                  selectable
                  users={this.usersArray}
                  onPickUser={user => this.pickUser(user)}
                  onUnpickUser={user => onUnpickUser(user)}
                  onEndReached={() => this.expand()}
                />
              </ScrollView>
            ) : null}
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
