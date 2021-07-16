import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { NavigationDrawerProp } from "react-navigation-drawer";

import { Icon } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import { Text } from "../../../ui/Typography";
import CreateFolderModal from "../containers/CreateFolderModal";
import { IFolder } from "../state/initMails";
import DrawerOption from "./DrawerOption";

type DrawerMenuProps = {
  activeItemKey: string;
  items: any[];
  folders: IFolder[];
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

  findFolder = (folderName: string) => {
    if (this.props.folders !== undefined && this.props.folders.length > 0) {
      const folderInfos = this.props.folders.find(item => item.folderName === folderName);
      if (folderInfos !== undefined) return folderInfos;
    }
    return { id: "", folderName: "", path: "", unread: 0, count: 0, folders: [] };
  };

  renderDrawerFolders = () => {
    const { navigation } = this.props;
    const currentFolder = this.getCurrentFolder(this.props.navigation.state);
    const inboxFolder: IFolder = this.findFolder("Inbox");
    return (
      <ScrollView>
        {inboxFolder !== undefined &&
          inboxFolder.folders !== undefined &&
          inboxFolder.folders.length > 0 &&
          inboxFolder.folders.map(folder => (
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
      </ScrollView>
    );
  };

  renderDrawerMessages = () => {
    const { navigation } = this.props;
    return (
      <View>
        <DrawerOption
          selected={this.isCurrentScreen("inbox")}
          iconName="inbox"
          label={I18n.t("zimbra-inbox")}
          navigate={() => navigation.navigate("inbox", { key: "inbox", folderName: undefined })}
          count={this.findFolder("Inbox").unread}
        />
        <DrawerOption
          selected={this.isCurrentScreen("sendMessages")}
          iconName="send"
          label={I18n.t("zimbra-outbox")}
          navigate={() => navigation.navigate("sendMessages", { key: "sendMessages", folderName: undefined })}
        />
        <DrawerOption
          selected={this.isCurrentScreen("drafts")}
          iconName="insert_drive_file"
          label={I18n.t("zimbra-drafts")}
          navigate={() => navigation.navigate("drafts", { key: "drafts", folderName: undefined })}
          count={this.findFolder("Drafts").count}
        />
        <DrawerOption
          selected={this.isCurrentScreen("trash")}
          iconName="delete"
          label={I18n.t("zimbra-trash")}
          navigate={() => navigation.navigate("trash", { key: "trash", folderName: undefined })}
        />
        <DrawerOption
          selected={this.isCurrentScreen("spams")}
          iconName="delete_sweep"
          label={I18n.t("zimbra-spams")}
          navigate={() => navigation.navigate("spams", { key: "spams", folderName: undefined })}
          count={this.findFolder("Junk").unread}
        />
      </View>
    );
  };

  render() {
    return (
      <PageContainer style={style.container}>
        <View style={style.labelContainer}>
          <Text style={style.labelText}>{I18n.t("zimbra-messages")}</Text>
        </View>
        {this.renderDrawerMessages()}
        <View style={style.labelContainer}>
          <Text style={style.labelText}>{I18n.t("zimbra-directories")}</Text>
        </View>
        {this.renderDrawerFolders()}
        <View style={style.drawerBottom}>
          <TouchableOpacity
            onPress={this.onFolderCreationModalShow}
            style={[style.labelContainer, { marginBottom: 2 }]}>
            <Icon size={22} name="create_new_folder" />
            <Text style={[style.labelText, { justifyContent: "center", marginBottom: 2 }]}>
              {I18n.t("zimbra-create-directory")}
            </Text>
          </TouchableOpacity>
        </View>
        <CreateFolderModal show={this.state.showFolderCreationModal} onClose={this.onFolderCreationModalClose} />
      </PageContainer>
    );
  }
}

const style = StyleSheet.create({
  labelContainer: {
    backgroundColor: "#eef7fb",
    paddingHorizontal: 5,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: 18,
    paddingLeft: 10,
  },
  container: {
    backgroundColor: "#FFF",
  },
  loadBar: {
    backgroundColor: "lightgrey",
    width: "100%",
    height: 20,
  },
  loadBarPercent: {
    backgroundColor: "#444",
    height: "100%",
  },
  drawerBottom: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
});
