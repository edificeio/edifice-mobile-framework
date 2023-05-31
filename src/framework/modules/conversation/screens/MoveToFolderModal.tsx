import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import MoveToFolderModalComponent from '~/framework/modules/conversation/components/MoveToFolderModal';
import { IFolder, getInitMailListState } from '~/framework/modules/conversation/state/initMails';

interface ConversationMoveToFolderModalEventProps {
  closeModal: () => any;
  moveToFolder: (ids: string[], folder: string) => any;
  moveToInbox: (ids: string[]) => any;
  restoreToFolder: (ids: string[], folder: string) => any;
  restoreToInbox: (ids: string[]) => any;
  successCallback: () => any;
}
interface ConversationMoveToFolderModalDataProps {
  folders: IFolder[];
  show: boolean;
  mail: any;
  currentFolder: string;
}
export type ConversationMoveToFolderModalProps = ConversationMoveToFolderModalEventProps & ConversationMoveToFolderModalDataProps;

interface ConversationMoveToFolderModalState {
  selectedFolder: string | null;
}

class ConversationMoveToFolderModal extends React.Component<
  ConversationMoveToFolderModalProps,
  ConversationMoveToFolderModalState
> {
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
    const { currentFolder, moveToFolder, moveToInbox, restoreToInbox, restoreToFolder, mail, successCallback, closeModal } =
      this.props;
    const { selectedFolder } = this.state;
    closeModal();
    if (!selectedFolder) return;
    if (currentFolder === 'trash') {
      if (selectedFolder === 'inbox') await restoreToInbox([mail.id]);
      else await restoreToFolder([mail.id], selectedFolder);
    } else {
      if (selectedFolder === 'inbox') await moveToInbox([mail.id]);
      else await moveToFolder([mail.id], selectedFolder);
    }
    successCallback();
  };

  public render() {
    const { selectedFolder } = this.state;
    return (
      <MoveToFolderModalComponent
        {...this.props}
        selectedFolder={selectedFolder}
        selectFolder={this.selectFolder}
        confirm={this.confirm}
      />
    );
  }
}

const mapStateToProps = (state: IGlobalState) => {
  return {
    folders: getInitMailListState(state).data.folders,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ConversationMoveToFolderModal);
