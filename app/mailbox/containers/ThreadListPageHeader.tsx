import * as React from "react";
import I18n from "react-native-i18n";
import { connect } from "react-redux";

import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";
import { SearchBar } from "../../ui/SearchBar";

import { clearFilterConversation, filterConversation } from "../actions/filter";
import { clearPickedUsers } from "../actions/pickUser";

import { Tracking } from "../../tracking/TrackingManager";

import conversationConfig from "../config";

export class ConversationTopBar extends React.PureComponent<
  {
    navigation?: any;
    conversationsIsEmpty: boolean;
    filter: (searchText) => void;
    clearFilter: () => void;
    clearPickedUsers: () => void;
  },
  { searching: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { searching: false };
  }

  private onClose() {
    const { navigation } = this.props;
    navigation.goBack();
  }

  public close() {
    this.setState({ searching: false });
    this.props.filter("");
  }

  /* Note : dunno what is this for, but it creates a bug when opening search for the first time
  public componentWillReceiveProps(nextProps) {
    if (nextProps.searchCleared) {
      console.log("searchCleared");
      this.setState({ searching: false });
    }
  }*/

  public openSearch() {
    this.setState({ searching: true });
    this.props.filter("");
    Tracking.logEvent("searchConversation");
  }

  public openNewConversation() {
    this.props.navigation.navigate("newThread");
    this.props.clearPickedUsers();
  }

  public search() {
    return (
      <SearchBar
        onClose={() => this.close()}
        onChange={search => this.props.filter(search)}
      />
    );
  }

  public defaultView() {
    return (
      <Header>
        <HeaderIcon
          onPress={() => this.openSearch()}
          hidden={this.props.conversationsIsEmpty}
          name={"search"}
        />
        <AppTitle>{I18n.t("Conversation")}</AppTitle>
        <HeaderIcon
          name={"new_message"}
          iconSize={24}
          onPress={() => this.openNewConversation()}
        />
      </Header>
    );
  }

  public render() {
    if (this.state.searching) {
      return this.search();
    }

    return this.defaultView();
  }
}

export default connect(
  (state: any) => {
    const threadListState = state[conversationConfig.reducerName].threadList;
    const filterState = state[conversationConfig.reducerName].filter;
    return {
      conversationsIsEmpty: threadListState.data.length === 0,
      searchCleared: !filterState.cleared
    };
  },
  dispatch => ({
    clearFilter: () => clearFilterConversation(dispatch)(),
    clearPickedUsers: () => clearPickedUsers(dispatch)(),
    filter: searchText => filterConversation(dispatch)(searchText)
  })
)(ConversationTopBar) as any;
