import style from "glamorous-native";
import * as React from "react";
import { TextInput, Platform, TouchableWithoutFeedback, Keyboard, View, KeyboardAvoidingView } from "react-native";
import { hasNotch } from "react-native-device-info";
import { CommonStyles } from "../styles/common/styles";
import I18n from "i18n-js";
import { PageContainer } from "./ContainerContent";
import UserList, { IUser } from "./UserList";
import TouchableOpacity from "../ui/CustomTouchableOpacity";
import { removeAccents } from "../utils/string";
import { IConversationMessage } from "../mailbox/reducers";
import { MessageBubble } from "../mailbox/components/ThreadMessage";
import { Text, TextBold, TextColor } from "./text";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-navigation";

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
  { remainingUsers; pickedUsers; onPickUser; onUnpickUser; onSelectSubject; subject; message: IConversationMessage; type: string },
  { searchText: string; subjectText?: string; max: number }
  > {
  state = { searchText: "", subjectText: undefined, max: 20 };
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
    const { onUnpickUser, pickedUsers, subject, message, type } = this.props;
    let { searchText, subjectText } = this.state;
    subjectText = subjectText ?? subject;
    let index = 0;
    return (
      <PageContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            enabled
            behavior={Platform.select({ "ios": "padding", "android": undefined })}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? hasNotch() ? 100 : 56 : undefined} // 🍔 Big-(M)Hack of the death : On iOS KeyboardAvoidingView not working properly.
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ flex: 1 }}>
                {/* Name field */}
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
                    onKeyPress={({ nativeEvent }) => {
                      searchText.length === 0
                        && nativeEvent.key === "Backspace"
                        && onUnpickUser(pickedUsers[pickedUsers.length - 1])
                    }}
                  />
                </FieldContainer>

                <View style={{ flex: 1 }}>

                  {this.usersArray.length > 0 ?
                    <ScrollView
                      keyboardShouldPersistTaps="always"
                      alwaysBounceVertical={false}
                      contentContainerStyle={{ flexGrow: 1 }}
                      style={{
                        width: "100%",
                        position: "absolute",
                        top: 0, bottom: 0,
                        zIndex: 1,
                        elevation: 1,
                        backgroundColor: CommonStyles.tabBottomColor
                      }}
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

                  <View style={{ flex: 1, zIndex: 0 }}>
                    <FieldContainer style={{ borderTopColor: '#EEEEEE', borderTopWidth: 1 }}>
                      <FieldName>{I18n.t("conversation-subjectPrefixInput")}</FieldName>
                      <TextInput
                        ref={r => (this.input = r)}
                        style={{ flex: 1, minWidth: 100, height: 40, color: CommonStyles.textColor, paddingTop: Platform.OS === "ios" ? 2 : 12 }}
                        underlineColorAndroid={"transparent"}
                        value={subjectText}
                        onChangeText={text => this.selectSubject(text)}
                      />
                    </FieldContainer>
                    {message
                      ? <View style={{ margin: 12, flex: 1 }}>
                        <TextBold>
                          {type === 'reply'
                            ? I18n.t("conversation-reply-backMessage")
                            : type === 'transfer'
                              ? I18n.t("conversation-transfer-backMessage")
                              : ""
                          }
                        </TextBold>
                        <View style={{ flex: 1 }}>
                          <MessageBubble
                            canScroll
                            contentHtml={message.body}
                            style={{ maxHeight: "100%" }}
                          />
                        </View>
                      </View>
                      : null
                    }
                  </View>

                </View>

              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </PageContainer>
    );
  }
}
