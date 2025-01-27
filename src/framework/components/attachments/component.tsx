import React, { useState } from 'react';
import { View, ViewStyle } from 'react-native';

import Attachment from './attachment';
import styles from './styles';
import { AttachmentsProps } from './types';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { cameraAction, documentAction, galleryAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import toast from '~/framework/components/toast';
import { IDistantFileWithId } from '~/framework/util/fileHandler';

export default function Attachments(props: AttachmentsProps) {
  const [attachments, setAttachments] = useState<IDistantFileWithId[]>(props.attachments ?? []);

  const addAttachment = async attachment => {
    try {
      if (!props.addAttachmentAction) return;
      const attachmentLoaded = await props.addAttachmentAction(attachment);
      setAttachments(attachments => [...attachments, attachmentLoaded]);
    } catch (e) {
      console.error(e);
      toast.showError(I18n.get('attachment-adderror'));
    }
  };

  const removeAttachment = async attachment => {
    try {
      if (!props.removeAttachmentAction) return;
      await props.removeAttachmentAction(attachment);
      setAttachments(attachments => attachments.filter(a => a.id !== attachment.id));
    } catch (e) {
      console.error(e);
      toast.showError(I18n.get('attachment-removeerror'));
    }
  };

  const suppContainerStyle: ViewStyle = {
    borderStyle: props.isEditing ? 'dashed' : 'solid',
  };

  return (
    <View style={[styles.container, suppContainerStyle]}>
      {attachments ? (
        <View style={styles.attachments}>
          {attachments.map(attachment => (
            <Attachment
              session={props.session}
              data={attachment}
              isEditing={props.isEditing}
              key={attachment.id}
              removeAttachment={removeAttachment}
            />
          ))}
        </View>
      ) : null}

      {props.isEditing ? (
        <PopupMenu
          actions={[
            cameraAction({ callback: addAttachment }),
            galleryAction({ callback: addAttachment }),
            documentAction({ callback: addAttachment }),
          ]}>
          <TertiaryButton iconLeft="ui-plus" text={I18n.get('attachment-attachments')} style={styles.button} />
        </PopupMenu>
      ) : null}
    </View>
  );
}
