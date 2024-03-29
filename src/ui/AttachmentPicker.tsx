import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Trackers } from '~/framework/util/tracker';
import { pickFileError } from '~/infra/actions/pickFile';
import { ContentUri } from '~/types/contentUri';

import { ILocalAttachment } from './Attachment';
import { AttachmentGroup } from './AttachmentGroup';
import { AttachmentGroupImages } from './AttachmentGroupImages';
import { ImagePicked } from '~/framework/components/menus/actions';

class AttachmentPicker_Unconnected extends React.PureComponent<{
  attachments: ContentUri[] | ILocalAttachment[];
  attachmentsHeightHalfScreen?: number;
  imageCallback?: (image: ImagePicked) => void;
  isContainerHalfScreen?: boolean;
  notifierId: string;
  onAttachmentRemoved: (attachments: ContentUri[] | ILocalAttachment[]) => void;
  onlyImages?: boolean;
  onPickFileError: (notifierId: string) => void;
}> {
  public onRemoveAttachment(index: number) {
    const { attachments, onAttachmentRemoved } = this.props;
    const attachmentsToSend = [...attachments];
    attachmentsToSend.splice(index, 1);
    onAttachmentRemoved(attachmentsToSend);
  }

  public render() {
    const { onlyImages, attachments, isContainerHalfScreen, attachmentsHeightHalfScreen, imageCallback, notifierId } = this.props;
    return onlyImages ? (
      <AttachmentGroupImages
        imageCallback={imageCallback}
        onRemove={index => this.onRemoveAttachment(index)}
        images={attachments as ILocalAttachment[]}
        moduleName={notifierId}
      />
    ) : (
      <AttachmentGroup
        editMode
        attachments={attachments as ILocalAttachment[]}
        onRemove={index => this.onRemoveAttachment(index)}
        onOpen={() => Trackers.trackEvent('Conversation', 'OPEN ATTACHMENT', 'Edit mode')}
        isContainerHalfScreen={isContainerHalfScreen}
        attachmentsHeightHalfScreen={attachmentsHeightHalfScreen}
      />
    );
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
