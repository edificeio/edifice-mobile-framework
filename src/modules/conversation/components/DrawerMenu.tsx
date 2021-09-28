import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { NavigationDrawerProp } from "react-navigation-drawer";

import { Icon } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import { Text } from "../../../ui/Typography";
import CreateFolderModal from "../containers/CreateFolderModal";
import { ICountMailboxes } from "../state/count";
import { IFolder } from "../state/initMails";
import DrawerOption from "./DrawerOption";

type DrawerMenuProps = {
  activeItemKey: string;
  items: any[];
  folders: IFolder[];
  mailboxesCount: ICountMailboxes;
  descriptors: any[];
  navigation: NavigationDrawerProp<any>;
};

type DrawerMenuState = {
  showFolderCreationModal: any;
};

export default class DrawerMenu extends React.PureComponent<DrawerMenuProps, DrawerMenuState> {
  constructor(props) {
    super(props);
    this.state = {
      showFolderCreationModal: false,
    };
  }

  onFolderCreationModalShow = () => {
    this.setState({
      showFolderCreationModal: true,
    });
  };

  onFolderCreationModalClose = () => {
    this.setState({
      showFolderCreationModal: false,
    });
  };

  isCurrentScreen = key => {
    return !this.getCurrentFolder(this.props.navigation.state) && this.props.activeItemKey === key;
  };

  getCurrentFolder = state => {
    if (this.props.activeItemKey !== "folder") return undefined;
    const folderState = state.routes.find(r => r.key === "folder");
    if (folderState.params === undefined) return undefined;
    return folderState.params.folderName;
  };

  renderDrawerFolders = () => {
    const { navigation, folders } = this.props;
    const currentFolder = this.getCurrentFolder(navigation.state);
    return (
      <ScrollView enabled={folders && folders.length > 0} style={{ marginTop: 15 }}>
        {folders && folders.length > 0 && folders.map(folder => (
          <DrawerOption
            selected={folder.folderName === currentFolder}
            iconName="folder"
            label={folder.folderName}
            navigate={() => {
              navigation.navigate("folder", { key: folder.folderName, folderName: folder.folderName, folderId: folder.id });
              navigation.closeDrawer();
            }}
            count={folder.unread}
          />
        ))}
        <TouchableOpacity
          onPress={this.onFolderCreationModalShow}
          style={style.createFolderContainer}
        >
          <Icon size={22} name="create_new_folder" />
          <Text style={style.createFolderText}>
            {I18n.t("conversation.createDirectory")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  renderDrawerMessages = () => {
    const { navigation, mailboxesCount } = this.props;
    return (
      <View>
        <DrawerOption
          selected={this.isCurrentScreen("inbox")}
          iconName="inbox"
          label={I18n.t("conversation.inbox")}
          navigate={() => navigation.navigate("inbox", { key: "inbox", folderName: undefined })}
          count={mailboxesCount.INBOX}
        />
        <DrawerOption
          selected={this.isCurrentScreen("sendMessages")}
          iconName="send"
          label={I18n.t("conversation.outbox")}
          navigate={() => navigation.navigate("sendMessages", { key: "sendMessages", folderName: undefined })}
        />
        <DrawerOption
          selected={this.isCurrentScreen("drafts")}
          iconName="insert_drive_file"
          label={I18n.t("conversation.drafts")}
          navigate={() => navigation.navigate("drafts", { key: "drafts", folderName: undefined })}
          count={mailboxesCount.DRAFT}
        />
        <DrawerOption
          selected={this.isCurrentScreen("trash")}
          iconName="delete"
          label={I18n.t("conversation.trash")}
          navigate={() => navigation.navigate("trash", { key: "trash", folderName: undefined })}
        />
      </View>
    );
  };

  render() {
    return (
      <PageContainer style={style.container}>
        {this.renderDrawerMessages()}
        {this.renderDrawerFolders()}
        <CreateFolderModal show={this.state.showFolderCreationModal} onClose={this.onFolderCreationModalClose} />
      </PageContainer>
    );
  }
}

const style = StyleSheet.create({
  createFolderContainer: {
    paddingHorizontal: 14,
    paddingTop: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  createFolderText: {
    fontSize: 18,
    paddingLeft: 10,
    marginBottom: 2,
    fontStyle: "italic"
  },
  container: {
    backgroundColor: "#FFF",
  },
  drawerBottom: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
});
