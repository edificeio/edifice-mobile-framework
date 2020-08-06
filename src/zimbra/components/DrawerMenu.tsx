import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { NavigationScreenProp } from "react-navigation";

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
  navigation: NavigationScreenProp<any>;
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
    if (this.props.activeItemKey !== "inbox") return undefined;
    const folderState = state.routes.find(r => r.key === "inbox");
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
          iconName="inbox"
          label={I18n.t("zimbra-inbox")}
          navigate={() => navigation.navigate("inbox", { key: "inbox", folderName: undefined })}
          count={count.data.INBOX}
        />
        <DrawerOption
          selected={this.isCurrentScreen("outbox")}
          iconName="outbox"
          label={I18n.t("zimbra-outbox")}
          navigate={() => navigation.navigate("outbox")}
        />
        <DrawerOption
          selected={this.isCurrentScreen("drafts")}
          iconName="file-document-outline"
          label={I18n.t("zimbra-drafts")}
          navigate={() => navigation.navigate("drafts")}
        />
        <DrawerOption
          selected={this.isCurrentScreen("trash")}
          iconName="trash"
          label={I18n.t("zimbra-trash")}
          navigate={() => navigation.navigate("trash")}
        />
        <DrawerOption
          selected={this.isCurrentScreen("spams")}
          iconName="deleted_files"
          label={I18n.t("zimbra-spams")}
          navigate={() => navigation.navigate("spams")}
        />
        <View style={style.labelContainer}>
          <Text style={style.labelText}>{I18n.t("zimbra-directories")}</Text>
        </View>
        <ScrollView>
          {folders.data.map(folder => (
            <DrawerOption
              selected={folder.name === currentFolder}
              iconName="workspace_folder"
              label={folder.name}
              navigate={() => {
                navigation.navigate("inbox", { key: folder.name, folderName: folder.name });
              }}
              count={count.data[folder.id]}
            />
          ))}
        </ScrollView>
        <View style={style.drawerBottom}>
          <TouchableOpacity
            onPress={this.onFolderCreationModalShow}
            style={[style.labelContainer, { marginBottom: 2 }]}>
            <Icon name="workspace_folder" />
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
    backgroundColor: "lightblue",
    padding: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: 18,
    paddingLeft: 10,
  },
  container: {},
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
