import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { moveMailsToFolderAction, moveMailsToInboxAction, restoreMailsAction } from "../actions/mail";
import MoveToFolderModalComponent from "../components/MoveToFolderModal";
import { getInitMailListState, IFolder } from "../state/initMails";

type MoveToFolderModalProps = {
  folders: IFolder[];
  show: boolean;
  mail: any;
  currentFolder: string;
  closeModal: () => any;
  moveToFolder: (ids: string[], folder: string) => any;
  moveToInbox: (ids: string[]) => any;
  restore: (ids: string[]) => any;
  successCallback: () => any;
};

type MoveToFolderModalState = {
  selectedFolder: string | null;
};

class MoveToFolderModal extends React.Component<MoveToFolderModalProps, MoveToFolderModalState> {
  constructor(props) {
    super(props);
    this.state = {
      selectedFolder: null,
    };
  }

  selectFolder = (selectedFolder: string) => {
    this.setState({
      selectedFolder,
    });
  };

  confirm = async () => {
    const { currentFolder, moveToFolder, moveToInbox, restore, mail, successCallback, closeModal } = this.props;
    const { selectedFolder } = this.state;
    closeModal();
    if (!selectedFolder) return;
    if (currentFolder === "trash") await restore([mail.id]);
    if (selectedFolder === "inbox") await moveToInbox([mail.id]);
    else await moveToFolder([mail.id], selectedFolder);
    successCallback();
  };

  public render() {
    return (
      <MoveToFolderModalComponent
        {...this.props}
        selectedFolder={this.state.selectedFolder}
        selectFolder={this.selectFolder}
        confirm={this.confirm}
      />
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    folders: getInitMailListState(state).data.folders,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      moveToFolder: moveMailsToFolderAction,
      moveToInbox: moveMailsToInboxAction,
      restore: restoreMailsAction
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MoveToFolderModal);
