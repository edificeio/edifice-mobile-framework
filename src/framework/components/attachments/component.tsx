import React, { useState } from 'react';
import { Alert, View, ViewStyle } from 'react-native';

import Attachment from './attachment';
import styles from './styles';
import { AttachmentsProps } from './types';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { IMailsMailAttachment } from '~/framework/modules/mails/model';

export default function Attachments(props: AttachmentsProps) {
  const addAttachments = () => Alert.alert('add attachments');

  const [attachments, setAttachments] = useState<IMailsMailAttachment[]>(props.attachments ?? []);

  const suppContainerStyle: ViewStyle = {
    borderStyle: props.isEditing ? 'dashed' : 'solid',
  };

  return (
    <View style={[styles.container, suppContainerStyle]}>
      {attachments ? (
        <View style={styles.attachments}>
          {attachments.map(attachment => (
            <Attachment name={attachment.filename} isEditing={props.isEditing} />
          ))}
        </View>
      ) : null}

      {props.isEditing ? (
        <TertiaryButton
          iconLeft="ui-plus"
          action={addAttachments}
          text={I18n.get('attachment-attachments')}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}
