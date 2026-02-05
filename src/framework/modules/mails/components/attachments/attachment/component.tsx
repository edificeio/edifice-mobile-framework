import React from 'react';
import { ActivityIndicator, Alert, Modal, Platform, TouchableOpacity, View } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import Share from 'react-native-share';

import styles from './styles';
import { AttachmentProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { SyncedFile } from '~/framework/util/fileHandler/models';
import fileTransferService from '~/framework/util/fileHandler/service';
import { PermissionError } from '~/framework/util/permissions';

export default function Attachment(props: AttachmentProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [sf, setSf] = React.useState<SyncedFile>();

  const ensureFileReadyForShare = React.useCallback(async (): Promise<SyncedFile> => {
    if (sf && (await sf.lf.exists())) {
      return sf;
    }

    const synfile = await fileTransferService.downloadFile(props.session, props.data, {});

    if (Platform.OS === 'android') {
      await synfile.moveToDownloadFolder();
    }

    setSf(synfile);
    return synfile;
  }, [props.data, props.session, sf]);

  const onDownload = async () => {
    try {
      setShowModal(true);
      const synfile = await fileTransferService.downloadFile(props.session, props.data, {});
      setShowModal(false);
      setSf(synfile);
      setTimeout(() => {
        synfile?.lf.open();
      }, 0);
    } catch (e) {
      setShowModal(false);
      console.error(e);
      toast.showError();
    }
  };

  const onDelete = () => {
    if (props.removeAttachment) props.removeAttachment!(props.data);
  };

  const shareFile = async (syncedFile: SyncedFile) => {
    if (Platform.OS === 'android') {
      await syncedFile.moveToDownloadFolder();
    }

    const filepath = syncedFile.filepath;
    if (!filepath) {
      throw new Error('Invalid filepath for sharing');
    }

    const url = filepath.startsWith('file://') ? filepath : `file://${filepath}`;

    await Share.open({
      failOnCancel: false,
      type: syncedFile.filetype,
      url,
    });
  };

  const onShare = React.useCallback(async () => {
    try {
      setIsDownloading(true);

      const file = await ensureFileReadyForShare();
      await shareFile(file);
    } catch (e) {
      console.debug('SHARE_ERROR_MESSAGE =', e);

      if (e instanceof PermissionError) {
        Alert.alert(
          I18n.get('carousel-share-permissionblocked-title'),
          I18n.get('carousel-share-permissionblocked-text', {
            appName: DeviceInfo.getApplicationName(),
          }),
        );
      } else {
        toast.showError(I18n.get('carousel-share-error'));
      }
    } finally {
      setIsDownloading(false);
    }
  }, [ensureFileReadyForShare]);

  const onOpen = async () => {
    try {
      if (!sf) return;
      await sf.lf.open();
    } catch {
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
    if (isDownloading) return <ActivityIndicator size="small" />;

    return (
      <TouchableOpacity style={styles.button} onPress={onShare} disabled={isDownloading}>
        <Svg
          name={'ui-share'}
          fill={theme.palette.grey.black}
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity onPress={sf ? onOpen : onDownload} style={styles.container} disabled={isDownloading}>
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
      <Modal visible={showModal} transparent={false} animationType="fade">
        <View style={styles.modal}>
          <ActivityIndicator size="large" color={theme.palette.grey.white} />
        </View>
      </Modal>
    </>
  );
}
