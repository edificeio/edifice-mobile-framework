import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { AttachmentProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { LocalFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';

export default function Attachment(props: AttachmentProps) {
  const [isDownloading, setIdDownloading] = React.useState(false);
  const [isDownload, setIsDownload] = React.useState(false);
  const [lf, setLf] = React.useState<LocalFile>();

  const onDownload = async () => {
    try {
      setIdDownloading(true);
      const sf = await fileTransferService.downloadFile(props.session, props.data, {});
      setLf(sf.lf);
      setIsDownload(true);
      toast.showSuccess(I18n.get('attachment-downloadsuccess'));
    } catch (e) {
      console.error(e);
      toast.showError();
    } finally {
      setIdDownloading(false);
    }
  };

  const onDelete = () => {
    if (props.removeAttachment) {
      Alert.alert(I18n.get('attachment-deleteconfirmtitle'), I18n.get('attachment-deleteconfirmtext'), [
        { text: I18n.get('common-cancel'), style: 'cancel' },
        { text: I18n.get('common-delete'), style: 'destructive', onPress: () => props.removeAttachment!(props.data) },
      ]);
    }
  };

  const onPress = async () => {
    try {
      await lf?.open();
    } catch (e) {
      toast.showError();
    }
  };

  const renderDeleteAction = () => {
    return (
      <TouchableOpacity style={styles.button} onPress={onDelete}>
        <Svg
          name={'ui-delete'}
          fill={theme.palette.status.failure.regular}
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
        />
      </TouchableOpacity>
    );
  };

  const renderDownloadAction = () => {
    return (
      <TouchableOpacity style={styles.button} onPress={onDownload} disabled={isDownload || isDownloading}>
        <Svg
          name={isDownload ? 'ui-check' : 'ui-download'}
          fill={isDownloading || isDownload ? theme.palette.grey.graphite : theme.palette.grey.black}
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
        />
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} disabled={!isDownload}>
      <Svg
        name="ui-attachment"
        fill={theme.palette.grey.black}
        width={UI_SIZES.elements.icon.medium}
        height={UI_SIZES.elements.icon.medium}
      />
      <BodyText style={styles.text} numberOfLines={1}>
        {props.data.filename}
      </BodyText>
      <View style={styles.separator} />
      {props.isEditing ? renderDeleteAction() : renderDownloadAction()}
    </TouchableOpacity>
  );
}
