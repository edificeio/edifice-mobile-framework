import I18n from "i18n-js";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Text, TextBold } from "../../ui/Typography";
import { fetchFoldersAction } from "../actions/folders";
import { fetchQuotaAction } from "../actions/quota";
import { getFolderListState } from "../state/folders";
import { getQuotaState } from "../state/quota";

type DrawerMenuProps = {
  fetchFolders: any;
  fetchQuota: any;
  activeItemKey: any;
  items: any[];
  folders: any;
  quota: any;
};

export class DrawerMenu extends React.Component<DrawerMenuProps> {
  componentDidMount() {
    this.props.fetchFolders();
    this.props.fetchQuota();
  }

  getIcon = text => {
    const item = this.props.activeItemKey;
    const iconStyle = item === text ? [style.itemIcon, { color: "white" }] : style.itemIcon;
    switch (text) {
      case I18n.t("zimbra-inbox"):
        return <Icon size={16} name="inbox" style={iconStyle} />;
      case I18n.t("zimbra-outbox"):
        return <Icon size={16} name="outbox" style={iconStyle} />;
      case I18n.t("zimbra-drafts"):
        return <Icon size={16} name="file-document-outline" style={iconStyle} />;
      case I18n.t("zimbra-trash"):
        return <Icon size={16} name="trash" style={iconStyle} />;
      case I18n.t("zimbra-spams"):
        return <Icon size={16} name="deleted_files" style={iconStyle} />;
    }
  };

  render() {
    const items = this.props.items;
    const { folders, quota } = this.props;
    const storagePercent = (quota.data.storage / Number(quota.data.quota)) * 100;
    return (
      <PageContainer style={style.container}>
        <View style={style.labelContainer}>
          <Text style={style.labelText}>{I18n.t("zimbra-messages")}</Text>
        </View>
        {items.map(item => (
          <TouchableOpacity
            style={this.props.activeItemKey === item.key ? [style.item, style.selectedItem] : style.item}>
            {this.getIcon(item.key)}
            {this.props.activeItemKey === item.key ? (
              <TextBold style={[style.itemTextSelected, style.itemText]}>{item.key}</TextBold>
            ) : (
              <Text style={style.itemText}>{item.key}</Text>
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
          <TouchableOpacity style={[style.labelContainer, { marginBottom: 2 }]}>
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

const mapStateToProps = (state: any) => {
  return {
    folders: getFolderListState(state),
    quota: getQuotaState(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      fetchFolders: fetchFoldersAction,
      fetchQuota: fetchQuotaAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DrawerMenu);
