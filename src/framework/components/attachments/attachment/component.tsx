import React from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { AttachmentProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { LocalFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';

export default function Attachment(props: AttachmentProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [lf, setLf] = React.useState<LocalFile>();

  const onDownload = async () => {
    try {
      setIsDownloading(true);
      const sf = await fileTransferService.downloadFile(props.session, props.data, {});
      setLf(sf.lf);
      await sf.lf.open();
    } catch (e) {
      console.error(e);
      toast.showError();
    } finally {
      setIsDownloading(false);
    }
  };

  const onDelete = () => {
    if (props.removeAttachment) props.removeAttachment!(props.data);
  };

  const onOpen = async () => {
    try {
      await lf?.open();
    } catch (e) {
      toast.showError();
    }
  };

  const renderDeleteAction = () => {
    return (
      <>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.button} onPress={onDelete}>
          <Svg
            name={'ui-delete'}
            fill={theme.palette.status.failure.regular}
            width={UI_SIZES.elements.icon.small}
            height={UI_SIZES.elements.icon.small}
          />
        </TouchableOpacity>
      </>
    );
  };

  return (
    <>
      <TouchableOpacity onPress={lf ? onOpen : onDownload} style={styles.container} disabled={isDownloading}>
        <Svg
          name="ui-attachment"
          fill={theme.palette.grey.black}
          width={UI_SIZES.elements.icon.medium}
          height={UI_SIZES.elements.icon.medium}
        />
        <BodyText style={styles.text} numberOfLines={1}>
          {props.data.filename}
        </BodyText>
        {props.isEditing ? renderDeleteAction() : null}
      </TouchableOpacity>
      <Modal visible={isDownloading} transparent={false} animationType="fade">
        <View style={styles.modal}>
          <ActivityIndicator size="large" color={theme.palette.grey.white} />
        </View>
      </Modal>
    </>
  );
}
