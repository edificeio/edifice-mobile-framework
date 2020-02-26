import style from "glamorous-native";
import * as React from "react";
import { TextInput, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { hasNotch } from "react-native-device-info";
import { CommonStyles } from "../styles/common/styles";
import I18n from "i18n-js";
import { PageContainer } from "./ContainerContent";
import UserList, { IUser } from "./UserList";
import TouchableOpacity from "../ui/CustomTouchableOpacity";
import { removeAccents } from "../utils/string";

export const UserLabel = style.text({
  color: CommonStyles.primary,
  textAlignVertical: "center",
});

const ScrollField = style.scrollView({
  maxHeight: 181,
  flexGrow: 0
});

const FieldContainer = style.view({
  flexDirection: "row",
  flexWrap: "wrap",
  backgroundColor: "#FFFFFF",
  alignItems: "center",
  paddingVertical: 10,
  paddingHorizontal: 17,
});

const FieldName = style.text({
  textAlignVertical: "center",
  marginRight: 5,
  marginVertical: 5,
  marginHorizontal: 3,
  color: CommonStyles.lightTextColor
});


export default class SelectThreadInfos extends React.Component<
  { remainingUsers; pickedUsers; onPickUser; onUnpickUser; onSelectSubject },
  { searchText: string; subjectText: string; max: number }
> {
  state = { searchText: "", subjectText: "", max: 20 };
  input: any;

  public inputRef: any;

  public isMatch = visible =>
    (visible.name &&
      removeAccents(visible.name.toLowerCase()).indexOf(
        removeAccents(this.state.searchText.toLowerCase())
      ) !== -1) ||
    (visible.displayName &&
      removeAccents(visible.displayName.toLowerCase()).indexOf(
        removeAccents(this.state.searchText.toLowerCase())
      ) !== -1);

  public expend() {
    this.setState({ max: this.state.max + 20 });
  }

  get usersArray(): IUser[] {
    const { remainingUsers } = this.props;
    return [
      ...remainingUsers
        .filter(v => this.state.searchText && this.isMatch(v))
        .slice(0, this.state.max)
    ];
  }

  public pickUser = (user: IUser) => {
    const { onPickUser } = this.props;
    onPickUser(user);
    this.setState({ searchText: "" });
  };

  public selectSubject = (subject: string) => {
    const { onSelectSubject } = this.props;
    this.setState({ subjectText: subject });
    onSelectSubject(subject);
  };

  public render() {
    const { searchText, subjectText } = this.state;
    const { onUnpickUser, pickedUsers } = this.props;
    let index = 0;
    return (
      <PageContainer>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            enabled
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? hasNotch() ? 100 : 76 : undefined} // 🍔 Big-(M)Hack of the death : On iOS KeyboardAvoidingView not working properly.
            style={{ flex: 1 }}
          >
            <ScrollField
              alwaysBounceVertical={false}
              style={{ backgroundColor: "#FFFFFF" }}
              ref={r => (this.inputRef = (r as any)?.innerComponent)}
              onLayout={() => {
                this.inputRef.scrollToEnd()
              }}
            >
              <FieldContainer>
                <FieldName>{I18n.t("conversation-receiverPrefixInput")}</FieldName>
                {pickedUsers.map(p => (
                  <TouchableOpacity
                    key={"Touchable_" + index++}
                    onPress={() => onUnpickUser(p)}
                    style={{
                      backgroundColor: CommonStyles.primaryLight,
                      borderRadius: 3,
                      padding: 5,
                      maxWidth: "100%",
                      marginHorizontal: 3,
                      marginVertical: 5,
                    }}
                  >
                    <UserLabel numberOfLines={2}>{p.name || p.displayName}</UserLabel>
                  </TouchableOpacity>
                ))}
                <TextInput
                  ref={r => (this.input = r)}
                  style={{ flex: 1, minWidth: 100, height: 40, color: CommonStyles.textColor }}
                  underlineColorAndroid={"transparent"}
                  value={searchText}
                  onChangeText={text => {
                    this.setState({ searchText: text });
                  }}
                  onFocus={() => {
                    this.inputRef.scrollToEnd();
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    searchText.length === 0
                    && nativeEvent.key === "Backspace"
                    && onUnpickUser(pickedUsers[pickedUsers.length-1])
                  }}
                />
              </FieldContainer>
            </ScrollField>

            {this.usersArray.length > 0 ? 
              <ScrollView
                keyboardShouldPersistTaps="always"
                alwaysBounceVertical={false}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <UserList
                  selectable={true}
                  users={this.usersArray}
                  onPickUser={user => this.pickUser(user)}
                  onUnpickUser={user => onUnpickUser(user)}
                  onEndReached={() => this.expend()}
                />
              </ScrollView>
            : 
              null
            }

            <FieldContainer style={{ borderTopColor: '#EEEEEE', borderTopWidth: 1}}>
              <FieldName>{I18n.t("conversation-subjectPrefixInput")}</FieldName>
              <TextInput
                ref={r => (this.input = r)}
                style={{ flex: 1, minWidth: 100, height: 40, color: CommonStyles.textColor, paddingTop: 2 }}
                underlineColorAndroid={"transparent"}
                value={subjectText}
                onChangeText={text => this.selectSubject(text)}
              />
            </FieldContainer>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </PageContainer>
    );
  }
}
