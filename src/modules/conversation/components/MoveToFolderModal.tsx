import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CommonStyles } from "../../../styles/common/styles";
import { Icon } from "../../../ui";
import { DialogButtonCancel, DialogButtonOk } from "../../../ui/ConfirmDialog";
import { ModalBox, ModalContent } from "../../../ui/Modal";
import { Text } from "../../../ui/Typography";
import { IFolder } from "../state/initMails";

type MoveToFolderModalProps = {
  show: boolean;
  folders: IFolder[];
  currentFolder: string;
  selectedFolder: string | null;
  closeModal: () => any;
  confirm: () => any;
  selectFolder: (id: string) => any;
};

export default class MoveToFolderModal extends React.Component<MoveToFolderModalProps> {
  private renderOption = (id, displayName, iconName) => {
    const { selectedFolder, selectFolder } = this.props;
    const selected = selectedFolder === id;
    const touchableStyle = selected ? [style.opacity, style.selectedItem] : style.opacity;
    const textStyle = selected ? { color: "white", fontSize: 18 } : { fontSize: 18 };
    const iconStyle = selected ? { color: "white", margin: 10 } : { margin: 10 };
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            selectFolder(id);
          }}
          style={touchableStyle}>
          <View style={style.rowView}>
            <Icon name={iconName} size={20} style={iconStyle} />
            <Text numberOfLines={1} style={textStyle}>
              {displayName}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={style.separator} />
      </>
    );
  };

  public findMainFolderId= (name: string) => {
    const folderInfos = this.props.folders.find(item => item.folderName === name);
    if (folderInfos) return folderInfos.id;
    else return ;
  };

  public render() {
    const { show, folders, closeModal, confirm, currentFolder } = this.props;
    const isCurrentFolderInbox = currentFolder === "inbox";
    const isCurrentFolderTrash = currentFolder === "trash";
    const foldersWithoutCurrent = folders.filter(folder => folder.folderName !== currentFolder);
    const isMoveImpossible = isCurrentFolderInbox && folders && folders.length === 0;
    const modalTitle = isMoveImpossible
      ? "conversation.moveImpossible"
      : `conversation.${isCurrentFolderTrash ? "restore" : "move"}To`;
    return (
      <ModalBox isVisible={show}>
        <ModalContent>
          <View style={style.containerView}>
            <View style={{ alignSelf: "baseline", paddingBottom: 8, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 18 }}>{I18n.t(modalTitle)}</Text>
            </View>
            {!isCurrentFolderInbox && (
              <>
                <View style={{ backgroundColor: "#eef7fb", width: "100%", padding: 4 }}>
                  <Text style={{ fontSize: 18 }}>{I18n.t("conversation.messages")}</Text>
                </View>
                {this.renderOption("inbox", I18n.t("conversation.inbox"), "inbox")}
              </>
            )}
            {foldersWithoutCurrent && foldersWithoutCurrent.length > 0 && (
              <View>
                <View style={{ backgroundColor: "lightblue", width: "100%", padding: 4 }}>
                  <Text style={{ fontSize: 18 }}>{I18n.t("conversation.directories")}</Text>
                </View>
                <ScrollView style={{ height: "33%" }}>
                  {foldersWithoutCurrent.map(f => this.renderOption(f.id, f.folderName, "folder"))}
                </ScrollView>
              </View>
            )}
            <View style={{ flexDirection: "row-reverse", padding: 20, paddingBottom: 10 }}>
              <DialogButtonOk disabled={isMoveImpossible} label={I18n.t(`conversation.${isCurrentFolderTrash ? "restore" : "move"}`)} onPress={confirm} />
              <DialogButtonCancel onPress={() => closeModal()} />
            </View>
          </View>
        </ModalContent>
      </ModalBox>
    );
  }
}

const style = StyleSheet.create({
  containerView: {
    flexGrow: 1,
    width: "100%",
    marginTop: -25,
  },
  rowView: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    overflow: "hidden",
    paddingRight: 90,
  },
  separator: {
    borderBottomColor: CommonStyles.borderColorVeryLighter,
    borderBottomWidth: 4,
    width: "100%",
  },
  opacity: {
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  selectedItem: {
    backgroundColor: "#fc8500",
  },
  itemTextSelected: {
    color: "white",
  },
});
