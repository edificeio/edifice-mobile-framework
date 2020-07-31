import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { NavigationScreenProp } from "react-navigation";

import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Text, TextBold } from "../../ui/Typography";
import CreateFolderModal from "../containers/CreateFolderModal";

type DrawerMenuProps = {
  fetchFolders: any;
  fetchQuota: any;
  activeItemKey: string;
  items: any[];
  folders: any;
  quota: any;
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

  getIcon = text => {
    const item = this.props.activeItemKey;
    const iconStyle = item === text ? [style.itemIcon, { color: "white" }] : style.itemIcon;
    switch (text) {
      case "inbox":
        return <Icon size={16} name="inbox" style={iconStyle} />;
      case "outbox":
        return <Icon size={16} name="outbox" style={iconStyle} />;
      case "drafts":
        return <Icon size={16} name="file-document-outline" style={iconStyle} />;
      case "trash":
        return <Icon size={16} name="trash" style={iconStyle} />;
      case "spams":
        return <Icon size={16} name="deleted_files" style={iconStyle} />;
    }
  };
  render() {
    const { items, descriptors } = this.props;
    const { folders, quota } = this.props;
    const storagePercent = (quota.data.storage / Number(quota.data.quota)) * 100;
    return (
      <PageContainer style={style.container}>
        <View style={style.labelContainer}>
          <Text style={style.labelText}>{I18n.t("zimbra-messages")}</Text>
        </View>
        {items.map(item => (
          <TouchableOpacity
            style={this.props.activeItemKey === item.key ? [style.item, style.selectedItem] : style.item}
            onPress={() => this.props.navigation.navigate(item.routeName)}>
            {this.getIcon(item.key)}
            {this.props.activeItemKey === item.key ? (
              <TextBold style={[style.itemTextSelected, style.itemText]}>
                {descriptors[item.key].options.drawerLabel}
              </TextBold>
            ) : (
              <Text style={style.itemText}>{descriptors[item.key].options.drawerLabel}</Text>
            )}
          </TouchableOpacity>
        ))}
        <View style={style.labelContainer}>
          <Text style={style.labelText}>{I18n.t("zimbra-directories")}</Text>
        </View>
        <ScrollView>
          {folders.data.map(folder => (
            <TouchableOpacity style={style.item}>
              <Icon style={style.itemIcon} name="workspace_folder" />
              <Text style={style.itemText}>{folder.name}</Text>
            </TouchableOpacity>
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
  item: {
    padding: 7,
    marginBottom: 8,
    backgroundColor: "white",
    flexDirection: "row",
  },
  selectedItem: {
    backgroundColor: "orange",
  },
  itemText: {
    marginLeft: 5,
    fontSize: 18,
  },
  itemTextSelected: {
    color: "white",
  },
  itemIcon: {
    alignSelf: "center",
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
