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
  paddingHorizontal: 17
});

const To = style.text({
  textAlignVertical: "center",
  marginRight: 5,
  marginVertical: 5,
  marginHorizontal: 3
});

export default class SearchUser extends React.Component<
  { remaining; picked; onPickUser; onUnpickUser },
  { searchText: string; max: number }
> {
  state = { searchText: "", max: 20 };
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
    // console.log("state max: ", this.state.max)
    this.setState({ ...this.state, max: this.state.max + 20 });
  }

  get usersArray(): IUser[] {
    return [
      ...this.props.picked,
      ...this.props.remaining
        .filter(v => this.state.searchText && this.isMatch(v))
        .slice(0, this.state.max)
    ];
  }

  public pickUser = (user: IUser) => {
    this.props.onPickUser(user);
    this.setState({ ...this.state, searchText: "" });
    this.input.clear();
  };

  public render() {
    let index = 0;
    return (
      <PageContainer>
        <ScrollField alwaysBounceVertical={false}>
          <FieldContainer>
            <To>{I18n.t("to")}</To>
            {this.props.picked.map(p => (
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
              value={this.state.searchText}
              onChangeText={text =>
                this.setState({ ...this.state, searchText: text })
              }
            />
          </FieldContainer>
        </ScrollField>
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
