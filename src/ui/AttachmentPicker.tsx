import * as React from "react";
import { AttachmentGroup } from "./AttachmentGroup";
import { AttachmentGroupImages } from "./AttachmentGroupImages";
import { ContentUri } from "../types/contentUri";
import { Trackers } from "../infra/tracker";
import { ILocalAttachment } from "./Attachment";
import pickFile from "../infra/actions/pickFile";

export class AttachmentPicker extends React.PureComponent<
  {
    attachments: ContentUri[] | ILocalAttachment[];
    onAttachmentSelected: (selectedAtt) => void;
    onAttachmentRemoved: (selectedAtt) => void;
    onlyImages?: boolean;
    isContainerHalfScreen?: boolean;
    attachmentsHeightHalfScreen?: number;
  }
> {
  public onPickAttachment() {
    const { onlyImages, onAttachmentSelected } = this.props;
    pickFile(onlyImages)
      .then(selectedAtt => onAttachmentSelected(selectedAtt))  
      .catch(err => console.log(err))
  }

  public onRemoveAttachment(index) {
    const { attachments, onAttachmentRemoved } = this.props;
    let attsToSend = [...attachments];
    attsToSend.splice(index, 1);
    onAttachmentRemoved(attsToSend)
  }

  public render() {
    const { onlyImages, attachments, isContainerHalfScreen, attachmentsHeightHalfScreen } = this.props;
    const attachmentsAdded = attachments.length > 0;

    return attachmentsAdded
      ? onlyImages
      ? <AttachmentGroupImages
          attachments={(attachments as ContentUri[])}
          onRemove={index => this.onRemoveAttachment(index)}
        />
      : <AttachmentGroup
          editMode
          attachments={(attachments as ILocalAttachment[])}
          onRemove={index => this.onRemoveAttachment(index)}
          onOpen={() => Trackers.trackEvent("Conversation", "OPEN ATTACHMENT", "Edit mode")}
          isContainerHalfScreen={isContainerHalfScreen}
          attachmentsHeightHalfScreen={attachmentsHeightHalfScreen}
        />
      : null 
  }
}
