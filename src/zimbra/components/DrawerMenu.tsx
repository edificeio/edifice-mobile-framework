import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { NavigationDrawerProp } from "react-navigation-drawer";

import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Text } from "../../ui/Typography";
import CreateFolderModal from "../containers/CreateFolderModal";
import DrawerOption from "./DrawerOption";

type DrawerMenuProps = {
  fetchFolders: any;
  fetchQuota: any;
  activeItemKey: string;
  items: any[];
  folders: any;
  quota: any;
  count: any;
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

  render() {
    const { navigation, folders, quota, count } = this.props;
    const storagePercent = (quota.data.storage / Number(quota.data.quota)) * 100;
    const currentFolder = this.getCurrentFolder(this.props.navigation.state);
    return (
      <PageContainer style={style.container}>
        <View style={style.labelContainer}>
          <Text style={style.labelText}>{I18n.t("zimbra-messages")}</Text>
        </View>
        <DrawerOption
          selected={this.isCurrentScreen("inbox")}
          iconName="material-inbox"
          label={I18n.t("zimbra-inbox")}
          navigate={() => navigation.navigate("inbox", { key: "inbox", folderName: undefined })}
          count={count.data.INBOX}
        />
        <DrawerOption
          selected={this.isCurrentScreen("outbox")}
          iconName="send"
          label={I18n.t("zimbra-outbox")}
          navigate={() => navigation.navigate("outbox", { key: "outbox", folderName: undefined })}
        />
        <DrawerOption
          selected={this.isCurrentScreen("drafts")}
          iconName="insert_drive_file"
          label={I18n.t("zimbra-drafts")}
          navigate={() => navigation.navigate("drafts", { key: "drafts", folderName: undefined })}
          count={count.data.DRAFTS}
        />
        <DrawerOption
          selected={this.isCurrentScreen("trash")}
          iconName="material-delete"
          label={I18n.t("zimbra-trash")}
          navigate={() => navigation.navigate("trash", { key: "trash", folderName: undefined })}
        />
        <DrawerOption
          selected={this.isCurrentScreen("spams")}
          iconName="delete_sweep"
          label={I18n.t("zimbra-spams")}
          navigate={() => navigation.navigate("spams", { key: "spams", folderName: undefined })}
          count={count.data.SPAMS}
        />
        <View style={style.labelContainer}>
          <Text style={style.labelText}>{I18n.t("zimbra-directories")}</Text>
        </View>
        <ScrollView>
          {folders.data.map(folder => (
            <DrawerOption
              selected={folder.name === currentFolder}
              iconName="material-folder"
              label={folder.name}
              navigate={() => {
                navigation.navigate("folder", { key: folder.name, folderName: folder.name });
                navigation.closeDrawer();
              }}
              count={count.data[folder.id]}
            />
          ))}
        </ScrollView>
        <View style={style.drawerBottom}>
          <TouchableOpacity
            onPress={this.onFolderCreationModalShow}
            style={[style.labelContainer, { marginBottom: 2 }]}>
            <Icon size={22} name="create_new_folder" />
            <Text style={[style.labelText, { justifyContent: "center", marginBottom: 2 }]}>
              {I18n.t("zimbra-create-directory")}
            </Text>
          </TouchableOpacity>
          <View style={style.labelContainer}>
            <Text style={[style.labelText, { justifyContent: "center" }]}>{I18n.t("zimbra-storage")}</Text>
          </View>
          <View style={style.loadBar}>
            <View style={[style.loadBarPercent, { width: `${storagePercent}%` }]}>
              <Text style={{ textAlign: "center", color: "white" }}>
                {Math.round(quota.data.storage / 10000) / 100} Mo
              </Text>
            </View>
          </View>
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
