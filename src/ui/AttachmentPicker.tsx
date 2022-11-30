import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Trackers } from '~/framework/util/tracker';
import pickFile, { pickFileError } from '~/infra/actions/pickFile';
import { ContentUri } from '~/types/contentUri';

import { ILocalAttachment } from './Attachment';
import { AttachmentGroup } from './AttachmentGroup';
import { AttachmentGroupImages } from './AttachmentGroupImages';

class AttachmentPicker_Unconnected extends React.PureComponent<{
  attachments: ContentUri[] | ILocalAttachment[];
  onAttachmentSelected: (selectedAtt) => void;
  onAttachmentRemoved: (selectedAtt) => void;
  onPickFileError: (notifierId: string) => void;
  onlyImages?: boolean;
  isContainerHalfScreen?: boolean;
  attachmentsHeightHalfScreen?: number;
  notifierId: string;
}> {
  public onPickAttachment() {
    const { onlyImages, onAttachmentSelected, onPickFileError, notifierId } = this.props;
    pickFile(onlyImages)
      .then(selectedAtt => onAttachmentSelected(selectedAtt))
      .catch(err => {
        if (err.message === 'Error picking image' || err.message === 'Error picking document') {
          onPickFileError(notifierId);
        }
      });
  }

  public onRemoveAttachment(index) {
    const { attachments, onAttachmentRemoved } = this.props;
    const attsToSend = [...attachments];
    attsToSend.splice(index, 1);
    onAttachmentRemoved(attsToSend);
  }

  public render() {
    const { onlyImages, attachments, isContainerHalfScreen, attachmentsHeightHalfScreen } = this.props;
    const attachmentsAdded = attachments.length > 0;

    return attachmentsAdded ? (
      onlyImages ? (
        <AttachmentGroupImages attachments={attachments as ContentUri[]} onRemove={index => this.onRemoveAttachment(index)} />
      ) : (
        <AttachmentGroup
          editMode
          attachments={attachments as ILocalAttachment[]}
          onRemove={index => this.onRemoveAttachment(index)}
          onOpen={() => Trackers.trackEvent('Conversation', 'OPEN ATTACHMENT', 'Edit mode')}
          isContainerHalfScreen={isContainerHalfScreen}
          attachmentsHeightHalfScreen={attachmentsHeightHalfScreen}
        />
      )
    ) : null;
  }
}

export const AttachmentPicker = connect(
  null,
  (dispatch: Dispatch) => ({
    onPickFileError: (notifierId: string) => dispatch(pickFileError(notifierId)),
  }),
  null,
  { forwardRef: true },
)(AttachmentPicker_Unconnected);
