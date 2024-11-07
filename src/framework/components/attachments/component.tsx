import React from 'react';
import { View, ViewStyle } from 'react-native';

import Attachment from './attachment';
import styles from './styles';
import { AttachmentsProps } from './types';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';

export default function Attachments(props: AttachmentsProps) {
  const addAttachments = () => console.log('add attachments');

  const suppContainerStyle: ViewStyle = {
    borderStyle: props.isEditing ? 'dashed' : 'solid',
  };

  return (
    <View style={[styles.container, suppContainerStyle]}>
      <View style={styles.attachments}>
        {props.attachments.map(attachment => (
          <Attachment name={attachment.name} isEditing={props.isEditing} />
        ))}
      </View>

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
