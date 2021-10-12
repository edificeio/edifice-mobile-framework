import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  ViewStyle
} from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { hasNotch } from "react-native-device-info";
import I18n from "i18n-js";

import theme from "../../../framework/util/theme";
import { Icon } from "../../../ui";
import { TextSemiBold, TextBold } from "../../../ui/Typography";
import CreateFolderModal from "../containers/CreateFolderModal";
import { ICountMailboxes } from "../state/count";
import { IFolder } from "../state/initMails";
import DrawerOption from "./DrawerOption";

type DrawerMenuProps = {
  items: any[];
  folders: IFolder[];
  mailboxesCount: ICountMailboxes;
  descriptors: any[];
  navigation: NavigationScreenProp<any>;
};

type DrawerMenuState = {
  showFolderCreationModal: boolean;
  showList: boolean;
  drawerMenuTotalHeight: number;
  animatedHeight: Animated.Value;
  animatedOpacity: Animated.Value;
};

export default class DrawerMenu extends React.PureComponent<DrawerMenuProps, DrawerMenuState> {
  constructor(props) {
    super(props);
    this.state = {
      showFolderCreationModal: false,
      showList: false,
      drawerMenuTotalHeight: 45,
      animatedHeight : new Animated.Value(45),
      animatedOpacity : new Animated.Value(0)
    };
  }

  componentDidUpdate(prevProps) {
    const { folders, firstFetch } = this.props;
    if (!firstFetch && folders.length - 1 === prevProps.folders.length) {
      this.onDrawerHeightToggle(true);
    }
  }
  
  onDrawerHeightToggle = (wasFolderCreated?: boolean) => {
    const { folders } = this.props;
    const { animatedHeight, showList } = this.state;
    const menuItemHeight = 45;
    const mailboxesNumber = 4;
    const mailboxesHeight = menuItemHeight * mailboxesNumber;
    const foldersNumber = folders && folders.length;
    const foldersHeight = foldersNumber ? menuItemHeight * foldersNumber : 0;
    const createFolderContainerHeight = menuItemHeight;
    const selectDirectoryContainerHeight = 20;
    const verticalPadding = 10;
    const drawerMenuTotalHeight = mailboxesHeight
      + foldersHeight
      + createFolderContainerHeight
      + selectDirectoryContainerHeight
      + verticalPadding;

    this.setState({ drawerMenuTotalHeight });
    Animated.timing(animatedHeight, {
      toValue : showList && !wasFolderCreated ? menuItemHeight : drawerMenuTotalHeight,
      timing : 400
    }).start();
  }

  onBackdropToggle = () => {
    const { animatedOpacity, showList } = this.state;
    Animated.timing(animatedOpacity, {
      toValue : showList ? 0 : 0.6,
      timing : 400
    }).start();
  }

  onListToggle = () => {
    const { showList } = this.state;
    this.onDrawerHeightToggle();
    this.onBackdropToggle();
    setTimeout(
      () => { this.setState({ showList: !showList }) },
      showList ? 400 : 0
    );
  };

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

  onChangeFolderName = () => {
    console.log("change folder name");
  }

  isCurrentScreen = key => {
    const { navigation } = this.props;
    const navKey = navigation.getParam("key");
    return navKey === key;
  };

  renderDrawerFolders = () => {
    const { navigation, folders } = this.props;
    const { showList } = this.state;
    const displayedFolders = showList
      ? folders
      : folders && folders.filter(folder => this.isCurrentScreen(folder.folderName));
    return (
      <>
        {displayedFolders && displayedFolders.length > 0 && displayedFolders.map(displayedFolder => (
          <View style={style.drawerOptionContainer}>
            <DrawerOption
              selected={this.isCurrentScreen(displayedFolder.folderName)}
              iconName="folder"
              label={displayedFolder.folderName}
              count={displayedFolder.unread}
              navigate={() => {
                if (showList && !this.isCurrentScreen(displayedFolder.folderName)) {
                  navigation.setParams({ 
                    key: displayedFolder.folderName,
                    folderName: displayedFolder.folderName,
                    folderId: displayedFolder.id 
                  });
                } else {
                  this.onListToggle();
                }
              }}
            />
            {/* {showList // TODO: add action to change folder name
              ? <TouchableOpacity onPress={this.onChangeFolderName}>
                  <Icon size={25} name={"pencil"} />
                </TouchableOpacity>
              : null
            } */}
          </View>
        ))}
        {showList
          ? <TouchableOpacity
              onPress={this.onFolderCreationModalShow}
              style={style.createFolderContainer}
            >
              <Icon size={25} name="create_new_folder" />
              <TextSemiBold style={style.createFolderText}>
                {I18n.t("conversation.createDirectory")}
              </TextSemiBold>
            </TouchableOpacity>
          : null
        }
      </>
    );
  };

  renderDrawerMailboxes = () => {
    const { navigation, mailboxesCount } = this.props;
    const { showList } = this.state;
    const mailboxes = [
      {name: "inbox", icon: "messagerie-on"},
      {name: "sendMessages", icon: "send" },
      {name: "drafts", icon: "pencil"},
      {name: "trash", icon: "delete"}
    ];
    const displayedMailboxes = showList
      ? mailboxes
      : mailboxes && mailboxes.filter(mailbox => this.isCurrentScreen(mailbox.name));
    return (
      <>
        {displayedMailboxes && displayedMailboxes.length > 0 && displayedMailboxes.map(displayedMailbox => (
          <DrawerOption
            selected={this.isCurrentScreen(displayedMailbox.name)}
            iconName={displayedMailbox.icon}
            label={I18n.t(`conversation.${displayedMailbox.name}`).toUpperCase()}
            navigate={() => {
              if (showList && !this.isCurrentScreen(displayedMailbox.name)) {
                navigation.setParams({ 
                  key: displayedMailbox.name,
                  folderName: undefined
                });
              } else {
                this.onListToggle();
              }
            }}
            count={displayedMailbox.name === "inbox"
              ? mailboxesCount.INBOX
              : displayedMailbox.name === "drafts"
              ? mailboxesCount.DRAFT : undefined
            }
          />
        ))}
      </>
    );
  };

  render() {
    const { showList, showFolderCreationModal, animatedOpacity, animatedHeight, drawerMenuTotalHeight } = this.state;

    const navHeight = Platform.OS === "ios" ? hasNotch() ? 40 : 20 : 0;
    const headerHeight = Platform.select({ ios: hasNotch() ? 100 : 76, default: 56 });
    const tabbarHeight = 56;
    const screenHeight = Dimensions.get("window").height;
    const drawerMaxHeight = screenHeight - headerHeight - navHeight - tabbarHeight;

    const animatedContainerHeight = { height: animatedHeight, maxHeight: drawerMaxHeight };
    const expandedAnimatedContainer: ViewStyle = showList 
      ? {
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          paddingTop: 10,
          flexDirection: "column",
          borderBottomWidth: undefined,
          borderBottomColor: undefined,
        }
      : {};

    const backdropDisplay = { 
      opacity : animatedOpacity,
      height: showList ? screenHeight : 0
    };

    return (
      <View style={style.container}>
        <Animated.View style={[style.animatedContainer, animatedContainerHeight, expandedAnimatedContainer]}> 
          <View style={style.selectDirectoryContainer}>
            <Icon
              size={12}
              name={"arrow_down"}
              color={theme.color.primary.regular}
              style={showList && {transform: [{ rotate: "180deg" }]}}
            />
            {showList 
              ? <TextBold style={style.selectDirectoryText}>
                  {I18n.t("conversation.selectDirectory")}
                </TextBold>
              : null
            }
          </View>
          <ScrollView
            style={{ marginLeft: showList ? 20 : 8 }}
            scrollEnabled={drawerMenuTotalHeight >= drawerMaxHeight}
            showsVerticalScrollIndicator={showList}
          >
            {this.renderDrawerMailboxes()}
            {this.renderDrawerFolders()}
          </ScrollView>
          <CreateFolderModal
            show={showFolderCreationModal}
            onClose={this.onFolderCreationModalClose}
          />
        </Animated.View>
        <TouchableWithoutFeedback onPress={() => this.onListToggle()}>
          <Animated.View style={[style.backdrop, backdropDisplay]} />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    width: "100%",
    position: "absolute",
    zIndex: 1,
  },
  animatedContainer: {
    backgroundColor: theme.color.background.card,
    paddingHorizontal: 20,
    position: "absolute",
    zIndex: 1,
    width: "100%",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.color.listItemBorder,
  },
  createFolderContainer: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  createFolderText: {
    marginLeft: 15,
    fontSize: 12,
    overflow: "hidden",
    color: theme.color.text.light,
  },
  drawerOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectDirectoryContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  selectDirectoryText: {
    color: theme.color.primary.regular,
    fontStyle: "italic",
    marginLeft: 10,
  },
  backdrop: {
    backgroundColor : "#000000",
  },
});
