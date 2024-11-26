import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { AttachmentProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';

export default function Attachment(props: AttachmentProps) {
  const onDownload = () => Alert.alert('download');
  const onDelete = () => Alert.alert('delete');

  const renderActionIcon = () => {
    return (
      <TouchableOpacity style={styles.button} onPress={props.isEditing ? onDelete : onDownload}>
        <NamedSVG
          name={props.isEditing ? 'ui-delete' : 'ui-download'}
          fill={props.isEditing ? theme.palette.status.failure.regular : theme.palette.grey.black}
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
        />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <NamedSVG
        name="ui-attachment"
        fill={theme.palette.grey.black}
        width={UI_SIZES.elements.icon.medium}
        height={UI_SIZES.elements.icon.medium}
      />
      <BodyText style={styles.text} numberOfLines={1}>
        {props.name}
      </BodyText>
      <View style={styles.separator} />
      {renderActionIcon()}
    </View>
  );
}
