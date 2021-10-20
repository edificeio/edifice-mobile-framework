import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  ViewStyle
} from "react-native";
import { NavigationScreenProp } from "react-navigation";
import I18n from "i18n-js";

import { ANIMATION_CONFIGURATIONS_FADE, ANIMATION_CONFIGURATIONS_SIZE, UI_SIZES } from "../../../framework/components/constants";
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
  isTogglingList: boolean;
  drawerHeight: number;
  animatedHeight: Animated.Value;
  animatedOpacity: Animated.Value;
};

export default class DrawerMenu extends React.PureComponent<DrawerMenuProps, DrawerMenuState> {
  constructor(props) {
    super(props);
    this.state = {
      showFolderCreationModal: false,
      showList: false,
      isTogglingList: false,
      drawerHeight : 45,
      animatedHeight : new Animated.Value(45),
      animatedOpacity : new Animated.Value(0)
    };
  }

  componentDidUpdate(prevProps) {
    const { folders, firstFetch } = this.props;
    if (!firstFetch && folders.length - 1 === prevProps.folders.length) {
      this.getDrawerHeightAnimation(true).start();
    }
  };

  getDrawerOpacityAnimation = () => {
    const { showList, animatedOpacity } = this.state;
    return Animated.timing(animatedOpacity, {
      toValue : showList ? 0 : 0.6,
      ...ANIMATION_CONFIGURATIONS_FADE
    });
  };

  getDrawerHeightAnimation = (wasFolderCreated?: boolean) => {
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
    const newHeightValue = showList && !wasFolderCreated ? menuItemHeight : drawerMenuTotalHeight;

    this.setState({ drawerHeight: newHeightValue });
    return Animated.timing(animatedHeight, {
      toValue : newHeightValue,
      ...ANIMATION_CONFIGURATIONS_SIZE
    });
  };

  onDrawerToggle = (callback?: Function) => {
    const { showList } = this.state;

    this.setState({ isTogglingList: true, showList: true });
    Animated.parallel([
      this.getDrawerOpacityAnimation(),
      this.getDrawerHeightAnimation()
    ]).start(() => {
      this.setState({ isTogglingList: false, showList: !showList });
      // Note: the setTimeout is used to smooth the animation
      setTimeout(() => callback && callback(), 0);
    });
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
    const { showList, isTogglingList } = this.state;
    const displayedFolders = showList
      ? folders
      : folders && folders.filter(folder => this.isCurrentScreen(folder.folderName));
    return (
      <>
        {displayedFolders && displayedFolders.length > 0 && displayedFolders.map(displayedFolder => (
          <View style={style.drawerOptionContainer}>
            <DrawerOption
              disabled={isTogglingList}
              selected={this.isCurrentScreen(displayedFolder.folderName)}
              iconName="folder"
              label={displayedFolder.folderName}
              count={displayedFolder.unread}
              navigate={() => {
                this.onDrawerToggle(() => {
                  if (!this.isCurrentScreen(displayedFolder.folderName)) {
                    navigation.setParams({ 
                      key: displayedFolder.folderName,
                      folderName: displayedFolder.folderName,
                      folderId: displayedFolder.id 
                    })
                  }
                })
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
    const { showList, isTogglingList } = this.state;
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
            disabled={isTogglingList}
            selected={this.isCurrentScreen(displayedMailbox.name)}
            iconName={displayedMailbox.icon}
            label={I18n.t(`conversation.${displayedMailbox.name}`).toUpperCase()}
            navigate={() => {
              this.onDrawerToggle(() => {
                if (!this.isCurrentScreen(displayedMailbox.name)) {
                  navigation.setParams({ 
                    key: displayedMailbox.name,
                    folderName: undefined,
                    folderId: undefined
                  })
                }
              })
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
    const { 
      showList,
      showFolderCreationModal,
      animatedOpacity,
      animatedHeight,
      isTogglingList,
      drawerHeight
    } = this.state;

    const drawerMaxHeight = UI_SIZES.getViewHeight();
    const isDrawerMaximallyExpanded = drawerHeight >= drawerMaxHeight;
    
    const animatedContainerHeight = { height: animatedHeight, maxHeight: drawerMaxHeight };
    const expandedAnimatedContainer: ViewStyle = showList 
      ? {
          borderBottomLeftRadius: isDrawerMaximallyExpanded ? undefined : 20,
          borderBottomRightRadius: isDrawerMaximallyExpanded ? undefined : 20,
          paddingTop: 10,
          flexDirection: "column",
          borderBottomWidth: undefined,
          borderBottomColor: undefined,
        }
      : {};

    const backdropDisplay = { 
      opacity : animatedOpacity,
      height: showList ? UI_SIZES.screenHeight : 0
    };

    return (
      <View style={style.container}>
        <TouchableWithoutFeedback onPress={() => this.onDrawerToggle()}>
          <Animated.View style={[style.backdrop, backdropDisplay]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[style.animatedContainer, animatedContainerHeight, expandedAnimatedContainer]}> 
          <TouchableOpacity
            style={style.selectDirectoryContainer}
            onPress={() => this.onDrawerToggle()}
            disabled={isTogglingList}
          >
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
          </TouchableOpacity>
          <ScrollView
            style={{ marginLeft: showList ? 20 : undefined }}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
            scrollEnabled={showList}
          >
            {this.renderDrawerMailboxes()}
            {this.renderDrawerFolders()}
          </ScrollView>
        </Animated.View>
        <CreateFolderModal
          show={showFolderCreationModal}
          onClose={this.onFolderCreationModalClose}
        />
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    width: "100%",
    position: "absolute",
  },
  animatedContainer: {
    backgroundColor: theme.color.background.card,
    paddingHorizontal: 20,
    position: "absolute",
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
    paddingRight: 8,
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
