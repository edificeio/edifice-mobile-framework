import I18n from "i18n-js";
import * as React from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-tiny-toast";
import { withNavigationFocus } from "react-navigation";
import { NavigationDrawerProp } from "react-navigation-drawer";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import withViewTracking from "../../../framework/util/tracker/withViewTracking";
import { CommonStyles } from "../../../styles/common/styles";
import { Icon } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import { Text } from "../../../ui/Typography";
import { Header as HeaderComponent } from "../../../ui/headers/Header";
import { HeaderAction } from "../../../ui/headers/NewHeader";
import { fetchInitAction } from "../actions/initMails";
import {
  deleteMailsAction,
  moveMailsToFolderAction,
  restoreMailsAction,
  toggleReadAction,
  trashMailsAction,
} from "../actions/mail";
import { fetchMailListAction, fetchMailListFromFolderAction } from "../actions/mailList";
import { ModalPermanentDelete } from "../components/DeleteMailsModal";
import MailList from "../components/MailList";
import MoveModal from "../containers/MoveToFolderModal";
import { getInitMailListState, IFolder } from "../state/initMails";
import { getMailListState, IMail } from "../state/mailList";
import { IInit } from "./DrawerMenu";

// ------------------------------------------------------------------------------------------------

type MailListContainerProps = {
  navigation: NavigationDrawerProp<any>;
  fetchInit: () => IInit;
  fetchMailList: (page: number, key: string, searchText?: string) => any;
  fetchMailFromFolder: (folderName: string, page: number, searchText?: string) => any;
  toggleRead: (mailIds: string[], read: boolean) => any;
  moveMailsToFolder: (mailIds: string[], folderId: string) => any;
  trashMails: (mailIds: string[]) => void;
  restoreMails: (mailIds: string[]) => void;
  deleteMails: (mailIds: string[]) => void;
  isPristine: boolean;
  isFetching: boolean;
  notifications: any;
  folders: IFolder[];
  isFocused: boolean;
  //props from search component
  isSearch: boolean;
  searchString: string;
  setSearchHeaderVisibility: (isShown: boolean) => void;
};

type MailListContainerState = {
  mails: any;
  unsubscribe: any;
  fetchRequested: boolean;
  firstFetch: boolean;
  isShownMoveModal: boolean;
  isHeaderSelectVisible: boolean;
  deleteModal: { isShown: boolean; mailsIds: string[] };
};

class MailListContainer extends React.PureComponent<MailListContainerProps, MailListContainerState> {
  constructor(props) {
    super(props);

    this.state = {
      mails: [],
      unsubscribe: this.props.navigation.addListener("didFocus", () => {
        this.forceUpdate();
      }),
      fetchRequested: false,
      firstFetch: false,
      isShownMoveModal: false,
      isHeaderSelectVisible: false,
      deleteModal: { isShown: false, mailsIds: [] },
    };
  }

  setMails = mailList => this.setState({ mails: mailList });

  private fetchMails = (page = 0) => {
    const { isSearch, searchString } = this.props;
    let isSearchValid = (isSearch && searchString !== "" && searchString.length >= 3) as boolean;

    this.setState({ fetchRequested: true });
    const key = this.props.navigation.getParam("key");
    const folderName = this.props.navigation.getParam("folderName");
    if (isSearchValid) {
      if (!folderName) this.props.fetchMailList(page, key, searchString);
      else this.props.fetchMailFromFolder(folderName, page, searchString);
    } else {
      if (!folderName) this.props.fetchMailList(page, key);
      else this.props.fetchMailFromFolder(folderName, page);
    }
  };

  fetchCompleted = () => {
    this.setState({ fetchRequested: false });
  };

  public componentDidMount() {
    if (this.props.navigation.getParam("key") === undefined) this.setState({ firstFetch: true });
    this.fetchMails();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isFetching && this.state.firstFetch) this.setState({ firstFetch: false });
    const folderName = this.props.navigation.getParam("folderName");
    if (
      !this.state.fetchRequested &&
      (folderName !== prevProps.navigation.getParam("folderName") ||
        (this.props.isFocused && prevProps.isFocused !== this.props.isFocused) ||
        this.props.searchString !== prevProps.searchString)
    ) {
      this.fetchMails();
    }
  }

  componentWillUnmount() {
    if (!this.props.isSearch) this.state.unsubscribe();
  }

  onGoBack = (goBack = false) => {
    this.setState({ isHeaderSelectVisible: false });
    if (this.props.isSearch) this.props.setSearchHeaderVisibility(false);
    this.props.navigation.setParams({ selectedMails: false });
    if (!goBack) this.fetchMails(0);
  };

  // -- LONG PRESS ACTIONS AND HEADER --------------------------------------------------------------

  restoreSelectedMails = async () => {
    let listSelected = this.getListSelectedMails();
    let mailsIds = [] as string[];
    listSelected.map(mail => mailsIds.push(mail.id));

    await this.props.restoreMails(mailsIds);

    Toast.show(mailsIds.length > 1 ? I18n.t("zimbra-messages-restored") : I18n.t("zimbra-message-restored"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
    this.onUnselectListMails();
  };

  actionsDeleteSuccess = async (mailsIds: string[]) => {
    const { navigation } = this.props;
    if (navigation.getParam("isTrashed") || navigation.state.routeName === "trash") {
      await this.props.deleteMails(mailsIds);
    }
    if (this.state.deleteModal.isShown) {
      this.setState({ deleteModal: { isShown: false, mailsIds: [] } });
    }

    Toast.show(mailsIds.length > 1 ? I18n.t("zimbra-messages-deleted") : I18n.t("zimbra-message-deleted"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
    this.onUnselectListMails();
  };

  public closeDeleteModal = () => this.onUnselectListMails();

  deleteSelectedMails = async () => {
    let listSelected = this.getListSelectedMails();
    let mailsIds = [] as string[];
    listSelected.map(mail => mailsIds.push(mail.id));

    const { navigation } = this.props;
    const isTrashed = navigation.getParam("isTrashed");
    if (isTrashed || navigation.state.routeName === "trash") {
      await this.setState({ deleteModal: { isShown: true, mailsIds: mailsIds } });
    } else {
      await this.props.trashMails(mailsIds);
      this.actionsDeleteSuccess(mailsIds);
    }
  };

  mailsMoved = () => {
    let listSelected = this.getListSelectedMails();
    this.onUnselectListMails();
    Toast.show(listSelected.length > 1 ? I18n.t("zimbra-messages-moved") : I18n.t("zimbra-message-moved"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  public showMoveModal = () => this.setState({ isShownMoveModal: true });

  public closeMoveModal = () => this.setState({ isShownMoveModal: false });

  markSelectedMailsAsUnread = async () => {
    let listSelected = this.getListSelectedMails();
    let mailsIds = [] as string[];
    listSelected.map(mail => mailsIds.push(mail.id));
    let isRead = listSelected.findIndex(mail => mail.unread === true) >= 0 ? true : false;
    await this.props.toggleRead(mailsIds, isRead);
    this.onUnselectListMails();
  };

  checkMailReadState = () => {
    let listSelected = this.getListSelectedMails();
    let index = listSelected.findIndex(mail => mail.unread === true);
    if (index === -1) return true;
    return false;
  };

  getListSelectedMails = () => {
    let listSelected = [] as IMail[];
    this.state.mails.map(mail => (mail.isChecked ? listSelected.push(mail) : null));
    return listSelected;
  };

  selectMails = () => {
    const { navigation } = this.props;
    if (this.getListSelectedMails().length > 0) {
      this.setState({ isHeaderSelectVisible: true });
      if (this.props.isSearch) this.props.setSearchHeaderVisibility(true);
      navigation.navigate(navigation.state.routeName, { selectedMails: true });
    } else {
      this.setState({ isHeaderSelectVisible: false });
      if (this.props.isSearch) this.props.setSearchHeaderVisibility(false);
      navigation.navigate(navigation.state.routeName, { selectedMails: false });
    }
  };

  onUnselectListMails = () => {
    const { navigation } = this.props;

    this.onGoBack(true);
    if (navigation.state.params && navigation.state.params.selectedMails && !this.props.isSearch) {
      navigation.navigate(navigation.state.routeName, { selectedMails: false });
    }
    this.fetchMails(0);
  };

  renderSelectedTrashMailsHeader = () => {
    return (
      <>
        <HeaderComponent color={CommonStyles.secondary}>
          <HeaderAction onPress={() => this.onUnselectListMails(true)} name="chevron-left1" />
          <Text style={{ color: "white", fontSize: 16, fontWeight: "400" }}>{this.getListSelectedMails().length}</Text>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => this.restoreSelectedMails()}>
              <Icon name="delete-restore" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.deleteSelectedMails()}>
              <Icon name="delete" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>
        </HeaderComponent>

        <ModalPermanentDelete
          deleteModal={this.state.deleteModal}
          closeModal={this.closeDeleteModal}
          actionsDeleteSuccess={this.actionsDeleteSuccess}
        />
      </>
    );
  };

  renderSelectedMailsHeader = () => {
    return (
      <>
        <HeaderComponent color={CommonStyles.secondary}>
          <HeaderAction onPress={() => this.onUnselectListMails()} name="chevron-left1" />
          <Text style={{ color: "white", fontSize: 16, fontWeight: "400" }}>{this.getListSelectedMails().length}</Text>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => this.markSelectedMailsAsUnread()}>
              {this.checkMailReadState() ? (
                <Icon name="email" size={24} color="white" style={{ marginRight: 10 }} />
              ) : (
                <Icon name="email-open" size={24} color="white" style={{ marginRight: 10 }} />
              )}
            </TouchableOpacity>
            {this.props.navigation.state.routeName !== "sendMessages" && (
              <TouchableOpacity onPress={() => this.showMoveModal()}>
                <Icon name="package-up" size={24} color="white" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => this.deleteSelectedMails()}>
              <Icon name="delete" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>
        </HeaderComponent>

        <MoveModal
          mail={this.getListSelectedMails()}
          show={this.state.isShownMoveModal}
          closeModal={this.closeMoveModal}
          successCallback={this.mailsMoved}
        />
      </>
    );
  };

  // ------------------------------------------------------------------------------------------------

  public render() {
    const { navigation } = this.props;
    return (
      <>
        <PageContainer>
          {this.state.isHeaderSelectVisible &&
            (navigation.getParam("isTrashed") || navigation.state.routeName === "trash"
              ? this.renderSelectedTrashMailsHeader()
              : this.renderSelectedMailsHeader())}

          <MailList
            {...this.props}
            setMails={this.setMails}
            fetchMails={this.fetchMails}
            isTrashed={this.props.navigation.getParam("key") === "trash"}
            isSended={this.props.navigation.getParam("key") === "sendMessages"}
            firstFetch={this.state.firstFetch}
            fetchRequested={this.state.fetchRequested}
            fetchCompleted={this.fetchCompleted}
            isHeaderSelectVisible={this.state.isHeaderSelectVisible}
            selectMails={this.selectMails}
            goBack={this.onGoBack}
          />
        </PageContainer>
      </>
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailListState(state);

  if (data !== undefined && data.length > 0) {
    for (let i = 0; i <= data.length - 1; i++) {
      data[i]["isChecked"] = false;
    }
  }

  const folders = getInitMailListState(state).data.folders;

  // Format props
  return {
    isPristine,
    isFetching,
    notifications: data,
    folders,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchMailList: fetchMailListAction,
      fetchMailFromFolder: fetchMailListFromFolderAction,
      fetchInit: fetchInitAction,
      toggleRead: toggleReadAction,
      moveMailsToFolder: moveMailsToFolderAction,
      trashMails: trashMailsAction,
      restoreMails: restoreMailsAction,
      deleteMails: deleteMailsAction,
    },
    dispatch
  );
};

// ------------------------------------------------------------------------------------------------

const viewsToTrack = ["inbox", "sendMessages", "drafts", "spams"];

const MailListContainerConnected = connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(MailListContainer));

export default withViewTracking((props: MailListContainerProps) => {
  const currentFolder = props.navigation.getParam("key");
  if (currentFolder === undefined) return `zimbra/inbox`;
  let toTrack = "";
  viewsToTrack.map(viewName => {
    if (viewName === currentFolder) toTrack = `zimbra/${currentFolder}`;
  });
  return toTrack;
})(MailListContainerConnected);
