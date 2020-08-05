import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { DialogButtonCancel, DialogButtonOk } from "../../ui/ConfirmDialog";
import { ModalBox, ModalContent } from "../../ui/Modal";
import { Text } from "../../ui/Typography";

type MoveToFolderModalProps = {
  show: boolean;
  folders: any;
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
            <Icon name={iconName} size={16} style={iconStyle} />
            <Text style={textStyle}>{displayName}</Text>
          </View>
        </TouchableOpacity>
        <View style={style.separator} />
      </>
    );
  };
  public render() {
    const { show, folders, closeModal, confirm } = this.props;
    return (
      <ModalBox isVisible={show}>
        <ModalContent>
          <View style={style.containerView}>
            <View style={{ alignSelf: "baseline", paddingBottom: 8, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 18 }}>{I18n.t("zimbra-move-to")}</Text>
            </View>
            <View style={{ backgroundColor: "lightblue", width: "100%", padding: 4 }}>
              <Text style={{ fontSize: 18 }}>{I18n.t("zimbra-messages")}</Text>
            </View>
            {this.renderOption("inbox", I18n.t("zimbra-inbox"), "inbox")}
            <View style={{ backgroundColor: "lightblue", width: "100%", padding: 4 }}>
              <Text style={{ fontSize: 18 }}>{I18n.t("zimbra-directories")}</Text>
            </View>
            {folders.data.map(f => (
              <>{this.renderOption(f.id, f.name, "workspace_folder")}</>
            ))}
            <View style={{ flexDirection: "row-reverse", padding: 20, paddingBottom: 10 }}>
              <DialogButtonOk label={I18n.t("zimbra-move")} onPress={confirm} />
              <DialogButtonCancel onPress={closeModal} />
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
    backgroundColor: "orange",
  },
  itemTextSelected: {
    color: "white",
  },
});
