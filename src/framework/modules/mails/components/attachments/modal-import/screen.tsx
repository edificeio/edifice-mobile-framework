import * as React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { AttachmentsImportScreenProps, UploadAttachment, UploadAttachmentStatus } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import {
  cameraAction,
  documentAction,
  DocumentPicked,
  galleryAction,
  ImagePicked,
  imagePickedToLocalFile,
} from '~/framework/components/menus/actions';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { CaptionBoldText, SmallText } from '~/framework/components/text';
import usePreventBack from '~/framework/hooks/prevent-back';
import { getSession } from '~/framework/modules/auth/reducer';
import Thumbnail from '~/framework/modules/mails/components/attachments/thumbnail';
import { mailsService } from '~/framework/modules/mails/service';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';

const headerTitleStyle = {
  color: theme.palette.grey.darkness,
};

export const computeNavBar: AttachmentsImportScreenProps.NavBarConfig = ({ navigation, route }) => ({
  presentation: 'modal',
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('import-title'),
  }),
  headerStyle: {
    backgroundColor: theme.ui.background.page,
    borderBottomWidth: 0,
    elevation: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowOpacity: 0,
    top: 0,
    zIndex: 100,
  },
  headerTitleStyle,
});

const formatFile = (pic: ImagePicked | DocumentPicked) =>
  ({
    error: undefined as string | undefined,
    localFile: { ...imagePickedToLocalFile(pic), filesize: pic.fileSize } as LocalFile,
    status: UploadAttachmentStatus.IDLE,
  }) as UploadAttachment;

const textErrorUploadAttachment: (error) => string = error => {
  // Full storage management
  // statusCode = 400 on iOS and code = 'ENOENT' on Android
  if (error?.response?.statusCode === 400 || error?.code === 'ENOENT') {
    return I18n.get('import-error-filetoolarge');
  } else {
    return I18n.get('import-uploaderror');
  }
};

const renderPlaceholder = () => {
  return (
    <Placeholder style={styles.placeholder} Animation={Fade}>
      <View style={styles.placeholderRow}>
        <PlaceholderMedia style={styles.placeholderMedia} size={36} />
        <PlaceholderLine style={styles.h22} width={80} />
      </View>
      <View style={styles.placeholderRow}>
        <PlaceholderMedia style={styles.placeholderMedia} size={36} />
        <PlaceholderLine style={styles.h22} width={55} />
      </View>
      <View style={styles.placeholderRow}>
        <PlaceholderMedia style={styles.placeholderMedia} size={36} />
        <PlaceholderLine style={styles.h22} width={65} />
      </View>
      <View style={styles.placeholderRow}>
        <PlaceholderMedia style={styles.placeholderMedia} size={36} />
        <PlaceholderLine style={styles.h22} width={35} />
      </View>
      <View style={styles.placeholderRow}>
        <PlaceholderMedia style={styles.placeholderMedia} size={36} />
        <PlaceholderLine style={styles.h22} width={70} />
      </View>
    </Placeholder>
  );
};

export default function AttachmentsImportScreen(props: AttachmentsImportScreenProps.AllProps) {
  const { navigation, route } = props;
  const session = getSession();

  // State that triggers exit the screen without confirmation prompt.
  const [validateImport, setValidateImport] = React.useState(false);

  // State that indicates the files to upload has been received from the device' storage
  const [listReady, setListReady] = React.useState(0);

  // The list of files to import and their import status
  const filesRef = React.useRef<UploadAttachment[]>(route.params.files ? route.params.files.map(formatFile) : []);

  // The bucket of allowed simultaneous uploading processes.
  const uploadingTasksRef = React.useRef<Set<UploadAttachment>>(new Set());
  const MAX_PARALLEL_UPLOADS_TASKS = 6;

  const updateFileStatusAndID = React.useCallback(
    ({
      error,
      file,
      id,
      status,
      url,
    }: {
      file: UploadAttachment;
      status: UploadAttachmentStatus;
      id?: string;
      error?: string;
      url?: string;
    }) => {
      file.status = status;
      if (id) file.id = id;
      if (url) file.url = url;
      if (error) file.error = error;
      setListReady(val => val + 1); // Update view
    },
    [],
  );

  const uploadAttachment = React.useCallback(
    (file: UploadAttachment, index: number) => {
      if (file.status === UploadAttachmentStatus.PENDING || file.status === UploadAttachmentStatus.OK) return;
      if (!session) {
        updateFileStatusAndID({ file, status: UploadAttachmentStatus.KO });
        return;
      }
      uploadingTasksRef.current.add(file);
      updateFileStatusAndID({ file, status: UploadAttachmentStatus.PENDING });
      mailsService.attachments
        .add(
          {
            draftId: route.params.draftId,
          },
          file.localFile,
          session,
        )
        .then(resp => {
          updateFileStatusAndID({ file, id: resp.df.id, status: UploadAttachmentStatus.OK, url: resp.df.url });
        })
        .catch(error => {
          console.error(`Import Attachment Upload Failed: ${error}`);
          updateFileStatusAndID({ error: textErrorUploadAttachment(error), file, status: UploadAttachmentStatus.KO });
        })
        .finally(() => {
          uploadingTasksRef.current.delete(file);
        });
    },
    [route.params.draftId, session, updateFileStatusAndID],
  );

  const uploadAttachments = React.useCallback(() => {
    for (let i = 0; i < filesRef.current.length; ++i) {
      if (uploadingTasksRef.current.size >= MAX_PARALLEL_UPLOADS_TASKS) break;
      const file = filesRef.current[i];
      if (file.status !== UploadAttachmentStatus.IDLE) continue;
      uploadAttachment(file, i);
    }
  }, [uploadAttachment]);

  const setFiles = React.useCallback(
    (f: ReturnType<typeof formatFile>[]) => {
      if (f.length === 0) {
        navigation.goBack();
        return;
      }
      filesRef.current = f;
      setListReady(val => val + 1);
      uploadAttachments();
    },
    [uploadAttachments, navigation],
  );

  const removeAllFiles = React.useCallback(() => {
    filesRef.current.forEach(f => {
      if (f.id === undefined) return;
      mailsService.attachments.remove({ attachmentId: f.id, draftId: route.params.draftId }).catch(error => {
        console.error(`Attachment removal failed: ${error}`);
      });
    });
  }, [route.params.draftId]);

  usePreventBack({
    actionOnBack: removeAllFiles,
    showAlert: filesRef.current.length > 0 && !validateImport,
    text: I18n.get('import-back-confirm-text'),
    title: I18n.get('import-back-confirm-title'),
  });

  // Manage nav bar actions
  React.useEffect(() => {
    const fileCount = filesRef.current.length;
    navigation.setOptions({
      // navigation.setOptions() requires to define the component on demand.

      headerRight: () =>
        filesRef.current.some(upload => upload.status === UploadAttachmentStatus.PENDING) ? (
          <ActivityIndicator size={UI_SIZES.elements.navbarIconSize} color={theme.palette.grey.black} />
        ) : (
          <NavBarAction
            title={I18n.get('import-confirm-button', {
              count: filesRef.current.filter(f => f.status === UploadAttachmentStatus.OK).length,
            })}
            titleStyle={{ color: theme.palette.grey.darkness }}
            onPress={() => {
              setValidateImport(true);
            }}
            disabled={
              !listReady ||
              (fileCount > 0 &&
                filesRef.current.some(
                  f =>
                    f.status === UploadAttachmentStatus.PENDING ||
                    f.status === UploadAttachmentStatus.IDLE ||
                    f.status === UploadAttachmentStatus.KO,
                ))
            }
          />
        ),
      headerTitle:
        fileCount === 0
          ? navBarTitle(I18n.get('import-title_zero'), headerTitleStyle)
          : navBarTitle(I18n.get('import-title_other', { count: fileCount }), headerTitleStyle),
    });
  }, [navigation, listReady]);

  React.useEffect(() => {
    if (validateImport) {
      navigation.navigate(route.params.redirectTo.name, {
        ...route.params.redirectTo.params,
        importAttachmentsResult: filesRef.current
          .filter(f => f.status === UploadAttachmentStatus.OK)
          .map(f => ({
            filename: f.localFile.filename,
            id: f.id,
            url: f.url,
          })),
      });
    }
  }, [validateImport, navigation, route]);

  React.useEffect(() => {
    if (filesRef.current.length === 0 && listReady) {
      navigation.goBack();
    }
  }, [listReady, navigation]);

  // Refresh remaining tasks everytime a file has been handled.
  React.useEffect(() => {
    if (listReady) {
      uploadAttachments();
    }
  }, [listReady, uploadAttachments]);

  React.useEffect(() => {
    setTimeout(() => {
      const commonCallback = (files: ImagePicked[] | DocumentPicked) => {
        const formatted = Array.isArray(files) ? files.map(formatFile) : [formatFile(files)];
        setFiles(formatted);
      };

      if (route.params.source === 'galery')
        return galleryAction({
          callback: commonCallback,
          multiple: true,
        }).action({ callbackOnce: true });
      if (route.params.source === 'camera')
        return cameraAction({
          callback: commonCallback,
        }).action({ callbackOnce: true });
      // Last source is 'documents'
      return documentAction({
        callback: commonCallback,
      }).action();
    }, 350);
    // On purpose : only when component is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeFile = React.useCallback(
    async (index: number) => {
      if (!session) return;
      if (index >= filesRef.current.length) return;
      Alert.alert(I18n.get('richeditor-showfilesresult-deletefiletitle'), I18n.get('richeditor-showfilesresult-deletefiletext'), [
        {
          onPress: () => {},
          text: I18n.get('common-cancel'),
        },
        {
          onPress: () => {
            const file = filesRef.current[index];
            if (file.id === undefined) {
              setFiles(filesRef.current.filter((_, i) => i !== index));
            } else {
              mailsService.attachments
                .remove({ attachmentId: file.id, draftId: route.params.draftId })
                .then(() => {
                  setFiles(filesRef.current.filter((_, i) => i !== index));
                })
                .catch(error => {
                  console.error(`Attachment removal failed: ${error}`);
                });
            }
          },
          style: 'destructive',
          text: I18n.get('common-delete'),
        },
      ]);
    },
    [route.params.draftId, session, setFiles],
  );

  const retryFile = async (index: number) => {
    const file = filesRef.current[index];
    file.status = UploadAttachmentStatus.PENDING;
    uploadAttachment(file, index);
  };

  const fileStatusIcon = (index: number, status: UploadAttachmentStatus) => {
    switch (status) {
      case UploadAttachmentStatus.OK:
        return <IconButton icon="ui-success" color={theme.palette.status.success.regular} />;
      case UploadAttachmentStatus.KO:
        return <IconButton icon="ui-restore" color={theme.palette.status.failure.regular} action={() => retryFile(index)} />;
      case UploadAttachmentStatus.PENDING:
        return <ActivityIndicator size={UI_SIZES.elements.icon.small} color={theme.palette.primary.regular} />;
      default:
        return null;
    }
  };

  if (!session) return <EmptyContentScreen />;

  return (
    <PageView>
      {!listReady ? (
        renderPlaceholder()
      ) : (
        <FlatList
          data={filesRef.current}
          contentContainerStyle={styles.addFilesResults}
          alwaysBounceVertical={false}
          renderItem={({ index, item }) => (
            <View key={index} style={styles.addFilesResultsItem}>
              <Thumbnail data={item} />
              <View style={styles.addFilesResultsFile}>
                <SmallText numberOfLines={1}>{item.localFile.filename}</SmallText>
                {item.status === UploadAttachmentStatus.KO ? <CaptionBoldText>{item.error}</CaptionBoldText> : null}
              </View>
              {fileStatusIcon(index, item.status)}
              <IconButton
                icon="ui-close"
                style={{ marginLeft: UI_SIZES.spacing.small }}
                color={theme.palette.grey.black}
                action={() => removeFile(index)}
              />
            </View>
          )}
        />
      )}
    </PageView>
  );
}
