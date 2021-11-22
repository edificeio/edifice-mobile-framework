import * as React from "react";
import { View } from "react-native";
import I18n from "i18n-js";
import DropDownPicker from "react-native-dropdown-picker";

import { DialogButtonCancel, DialogButtonOk } from "../../../ui/ConfirmDialog";
import { ModalBox, ModalContent } from "../../../ui/Modal";
import { IFolder } from "../state/initMails";
import theme from "../../../app/theme";
import { TextBold, TextSemiBold } from "../../../framework/components/text";

type MoveToFolderModalProps = {
  show: boolean;
  folders: IFolder[];
  currentFolder: string;
  selectedFolder: string | null;
  closeModal: () => any;
  confirm: () => any;
  selectFolder: (id: string) => any;
};

type MoveToFolderModalState = {
  openDropdown: boolean;
};

export default class MoveToFolderModal extends React.Component<MoveToFolderModalProps, MoveToFolderModalState> {
  constructor(props) {
    super(props);
    this.state = {
      openDropdown: false
    };
  }

  public render() {
    const { show, folders, closeModal, confirm, currentFolder, selectFolder, selectedFolder } = this.props;
    const { openDropdown } = this.state;
    const isCurrentFolderInbox = currentFolder === "inbox";
    const isCurrentFolderTrash = currentFolder === "trash";
    const modalTitle = `conversation.${isCurrentFolderTrash ? "restore" : "move"}To`;
    const foldersWithoutCurrent = folders && folders.filter(folder => folder.folderName !== currentFolder);
    let options: any = [];
    !isCurrentFolderInbox && options.push({ label: I18n.t("conversation.inbox"), value: "inbox" });
    foldersWithoutCurrent && foldersWithoutCurrent.length > 0 && foldersWithoutCurrent
      .map(folder => ({ label: folder.folderName, value: folder.id }))
      .forEach(folder => options.push(folder));
    const isMoveImpossible = options.length === 0;

    return (
      <ModalBox
        isVisible={show}
        onBackdropPress={() => {
          selectFolder("");
          closeModal();
        }}
      >
        <ModalContent
          style={{
            height: 250,
            padding: 20,
            paddingTop: undefined,
            width: undefined,
            justifyContent: "space-between",
          }}
        >
          <TextBold>{I18n.t(modalTitle)}</TextBold>
          {isMoveImpossible
            ? <TextSemiBold>{I18n.t("conversation.moveImpossible")}</TextSemiBold>
            : <DropDownPicker
                open={openDropdown}
                items={options}
                value={selectedFolder}
                setOpen={() => this.setState({openDropdown: !openDropdown})}
                setValue={callback => selectFolder(callback(selectedFolder))}
                placeholder={I18n.t("conversation.moveSelect")}
                placeholderStyle={{ color: theme.color.neutral.regular }}
                textStyle={{ color: theme.color.secondary.regular, fontWeight: "bold" }}
                style={{ borderColor: theme.color.secondary.regular, borderWidth: 1 }}
              />
          }
          <View style={{ flexDirection: "row" }}>
            <DialogButtonCancel
              onPress={() => {
                selectFolder("");
                closeModal();
              }}
              style={{ 
                backgroundColor: theme.color.background.card,
                borderColor: theme.color.secondary.regular,
                borderWidth: 1,
                borderRadius: 20,
                width: 150
              }}
              textStyle={{ color: theme.color.secondary.regular, fontWeight: "bold" }}
            />
            <DialogButtonOk
              onPress={() => {
                selectFolder("");
                confirm();
              }}
              style={{ 
                backgroundColor: isMoveImpossible || !selectedFolder ? theme.color.neutral.regular : theme.color.secondary.regular,
                borderRadius: 20,
                width: 150
              }}
              textStyle={{ fontWeight: "bold" }}
              disabled={isMoveImpossible || !selectedFolder}
              label={I18n.t(`conversation.${isCurrentFolderTrash ? "restore" : "move"}`)}
            />
          </View>
        </ModalContent>
      </ModalBox>
    );
  }
}
