import * as React from 'react';

import { connect } from 'react-redux';

import { ILocalAttachment } from './Attachment';
import { AttachmentGroup } from './AttachmentGroup';
import { AttachmentGroupImages } from './AttachmentGroupImages';

import { Trackers } from '~/framework/util/tracker';

class AttachmentPicker_Unconnected extends React.PureComponent<{
  attachments: ILocalAttachment[];
  attachmentsHeightHalfScreen?: number;
  isContainerHalfScreen?: boolean;
  notifierId: string;

  onAttachmentAdded?: (attachments: ILocalAttachment[]) => void;
  onAttachmentRemoved: (attachments: ILocalAttachment[]) => void;

  onlyImages?: boolean;
}> {
  onRemoveAttachment(index: number) {
    const attachments = [...this.props.attachments];
    attachments.splice(index, 1);
    this.props.onAttachmentRemoved(attachments);
  }

  render() {
    const { attachments, attachmentsHeightHalfScreen, isContainerHalfScreen, notifierId, onlyImages } = this.props;

    return onlyImages ? (
      <AttachmentGroupImages
        moduleName={notifierId}
        images={attachments}
        onRemove={index => this.onRemoveAttachment(index)}
        onAdd={files => {
          this.props.onAttachmentAdded?.(files);
        }}
      />
    ) : (
      <AttachmentGroup
        editMode
        attachments={attachments}
        onRemove={index => this.onRemoveAttachment(index)}
        onOpen={() => Trackers.trackEvent('Conversation', 'OPEN ATTACHMENT', 'Edit mode')}
        isContainerHalfScreen={isContainerHalfScreen}
        attachmentsHeightHalfScreen={attachmentsHeightHalfScreen}
        referer={undefined}
      />
    );
  }
}

export const AttachmentPicker = connect(null, null, null, { forwardRef: true })(AttachmentPicker_Unconnected);
