import style from "glamorous-native";
import * as React from "react";
import { TextInput } from "react-native";
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
    return [
      ...this.props.pickedUsers,
      ...this.props.remainingUsers
        .filter(v => this.state.searchText && this.isMatch(v))
        .slice(0, this.state.max)
    ];
  }

  public pickUser = (user: IUser) => {
    this.props.onPickUser(user);
    this.setState({ searchText: "" });
  };

  public selectSubject = (subject: string) => {
    this.setState({ subjectText: subject });
    this.props.onSelectSubject(subject);
  };

  public render() {
    const { searchText, subjectText } = this.state;
    let index = 0;
    return (
      <PageContainer>
        <ScrollField alwaysBounceVertical={false}>
          <FieldContainer>
            <FieldName>{I18n.t("conversation-receiverPrefixInput")}</FieldName>
            {this.props.pickedUsers.map(p => (
              <TouchableOpacity
                key={"Touchable_" + index++}
                onPress={() => this.props.onUnpickUser(p)}
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
              onChangeText={text => this.setState({ searchText: text })}
            />
          </FieldContainer>
        </ScrollField>
        <FieldContainer>
          <FieldName>{I18n.t("conversation-subjectPrefixInput")}</FieldName>
          <TextInput
            ref={r => (this.input = r)}
            style={{ flex: 1, minWidth: 100, height: 40, color: CommonStyles.textColor, paddingTop: 2 }}
            underlineColorAndroid={"transparent"}
            value={subjectText}
            onChangeText={text => this.selectSubject(text)}
          />
        </FieldContainer>
        <UserList
          selectable={true}
          users={this.usersArray}
          onPickUser={user => this.pickUser(user)}
          onUnpickUser={user => this.props.onUnpickUser(user)}
          onEndReached={() => this.expend()}
        />
      </PageContainer>
    );
  }
}
