import * as React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { UploadFile, UploadStatus } from '~/framework/components/inputs/rich-text/form/types';
import FlatList from '~/framework/components/list/flat-list';
import { LoadingIndicator } from '~/framework/components/loading';
import { ImagePicked, cameraAction, galleryAction, imagePickedToLocalFile } from '~/framework/components/menus/actions';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { CaptionBoldText, HeadingXSText, SmallText } from '~/framework/components/text';
import usePreventBack from '~/framework/hooks/prevent-back';
import { getSession } from '~/framework/modules/auth/reducer';
import workspaceService from '~/framework/modules/workspace/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import { Image } from '~/framework/util/media';

import styles from './styles';
import { FileImportScreenProps } from './types';

export const computeNavBar: FileImportScreenProps.NavBarConfig = ({ navigation, route }) => ({
  presentation: 'modal',
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('import-title'),
  }),
});

const formatFile = (pic: ImagePicked) =>
  ({
    localFile: { ...imagePickedToLocalFile(pic), filesize: pic.fileSize } as LocalFile,
    status: UploadStatus.IDLE,
    error: undefined as string | undefined,
    workspaceID: undefined as string | undefined,
  }) as UploadFile;

const textErrorUploadFile: (error) => string = error => {
  // Full storage management
  // statusCode = 400 on iOS and code = 'ENOENT' on Android
  if (error?.response?.statusCode === 400 || error?.code === 'ENOENT') {
    return I18n.get('import-error-filetoolarge');
  } else {
    return I18n.get('import-uploaderror');
  }
};

export default function FileImportScreen(props: FileImportScreenProps.AllProps) {
  const { navigation, route } = props;
  const session = getSession();

  const [validateImport, setValidateImport] = React.useState(false);
  const [listReady, setListReady] = React.useState(0);
  const filesRef = React.useRef<UploadFile[]>(route.params.files ? route.params.files.map(formatFile) : []);

  const updateFileStatusAndID = React.useCallback(
    ({ file, status, id, error }: { file: UploadFile; status: UploadStatus; id?: string; error?: string }) => {
      file.status = status;
      if (id) file.workspaceID = id;
      if (error) file.error = error;
      setListReady(val => val + 1); // Update view
    },
    [],
  );

  const uploadFile = React.useCallback(
    (file: UploadFile, index: number) => {
      if (file.status === UploadStatus.PENDING || file.status === UploadStatus.OK) return;
      if (!session) {
        updateFileStatusAndID({ file, status: UploadStatus.KO });
        return;
      }
      workspaceService.file
        .uploadFile(session, file.localFile, route.params.uploadParams)
        .then(resp => {
          updateFileStatusAndID({ file, status: UploadStatus.OK, id: resp.df.id });
        })
        .catch(error => {
          console.debug(`Import File Upload Failed: ${error}`);
          updateFileStatusAndID({ file, status: UploadStatus.KO, error: textErrorUploadFile(error) });
        });
    },
    [route.params.uploadParams, session, updateFileStatusAndID],
  );

  const setFiles = React.useCallback(
    (f: ReturnType<typeof formatFile>[]) => {
      filesRef.current = f;
      setListReady(val => val + 1);
      filesRef.current.forEach(uploadFile);
    },
    [uploadFile],
  );

  const removeAllFiles = React.useCallback(() => {
    workspaceService.files.trash(
      session!,
      filesRef.current.map(f => f.workspaceID!),
    );
  }, [session]);

  usePreventBack({
    title: I18n.get('import-back-confirm-title'),
    text: I18n.get('import-back-confirm-text'),
    showAlert: filesRef.current.length > 0 && !validateImport,
    actionOnBack: removeAllFiles,
  });

  // Manage nav bar actions
  React.useEffect(() => {
    navigation.setOptions({
      // navigation.setOptions() requires to define the component on demand.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <NavBarAction
          title={I18n.get('import-confirm-button', { count: filesRef.current.length })}
          onPress={() => {
            setValidateImport(true);
          }}
          disabled={
            !listReady ||
            (filesRef.current.length > 0 &&
              filesRef.current.some(f => f.status === UploadStatus.PENDING || f.status === UploadStatus.IDLE))
          }
        />
      ),
    });
  }, [navigation, listReady]);

  React.useEffect(() => {
    if (validateImport) {
      navigation.navigate(route.params.redirectTo.name, {
        ...route.params.redirectTo.params,
        importResult: filesRef.current.map(f => ({
          status: f.status,
          workspaceID: f.workspaceID,
        })),
      });
    }
  }, [validateImport, navigation, route]);

  React.useEffect(() => {
    if (filesRef.current.length === 0 && listReady) {
      navigation.goBack();
    }
  }, [listReady, navigation]);

  React.useEffect(() => {
    setTimeout(() => {
      if (route.params.source === 'galery') {
        galleryAction({
          callback: (pics: ImagePicked[]) => {
            setFiles(pics.map(formatFile));
          },
          multiple: true,
        }).action({ callbackOnce: true });
      } else if (route.params.source === 'camera') {
        cameraAction({
          callback: (pic: ImagePicked) => {
            setFiles([formatFile(pic)]);
          },
        }).action();
      }
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
          text: I18n.get('common-cancel'),
          onPress: () => {},
        },
        {
          text: I18n.get('common-delete'),
          style: 'destructive',
          onPress: () => {
            const file = filesRef.current[index];
            if (file.workspaceID === undefined) {
              setFiles(f => f.filter((it, i) => i !== index));
            } else {
              workspaceService.files
                .trash(session, [file.workspaceID!])
                .then(() => {
                  setFiles(f => f.filter((it, i) => i !== index));
                })
                .catch(error => {
                  console.error(`Rich Editor file removal failed: ${error}`);
                });
            }
          },
        },
      ]);
    },
    [session, setFiles],
  );

  const retryFile = async (index: number) => {
    const file = filesRef.current[index];
    file.status = UploadStatus.PENDING;
    uploadFile(file, index);
  };

  const fileStatusIcon = (index: number, status: UploadStatus) => {
    switch (status) {
      case UploadStatus.OK:
        return <IconButton icon="ui-success" color={theme.palette.status.success.regular} />;
      case UploadStatus.KO:
        return <IconButton icon="ui-restore" color={theme.palette.status.failure.regular} action={() => retryFile(index)} />;
      default:
        return <ActivityIndicator size={UI_SIZES.elements.icon.small} color={theme.palette.primary.regular} />;
    }
  };

  const renderThumbnail = (file: UploadFile) => {
    if (file.status === UploadStatus.OK) return <Image style={styles.addFilesResultsType} src={file.localFile._filepathNative} />;
    return (
      <View
        style={[
          styles.addFilesResultsType,
          {
            backgroundColor:
              file.status === UploadStatus.KO ? theme.palette.status.failure.pale : theme.palette.complementary.green.pale,
          },
        ]}>
        <NamedSVG
          name={file.status === UploadStatus.KO ? 'ui-error' : 'ui-image'}
          height={UI_SIZES.elements.icon.small}
          width={UI_SIZES.elements.icon.small}
          fill={file.status === UploadStatus.KO ? theme.palette.status.failure.regular : theme.palette.grey.black}
        />
      </View>
    );
  };

  if (!session) return <EmptyContentScreen />;

  return (
    <PageView>
      {!listReady ? (
        <LoadingIndicator />
      ) : (
        <FlatList
          data={filesRef.current}
          contentContainerStyle={styles.addFilesResults}
          alwaysBounceVertical={false}
          renderItem={({ item, index }) => (
            <View key={index} style={styles.addFilesResultsItem}>
              {renderThumbnail(item)}
              <View style={styles.addFilesResultsFile}>
                <SmallText numberOfLines={1}>{item.localFile.filename}</SmallText>
                {item.status === UploadStatus.KO ? <CaptionBoldText>{item.error}</CaptionBoldText> : null}
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
          ListHeaderComponent={
            <HeadingXSText style={styles.addFilesResultsTitle}>
              {filesRef.current.length}{' '}
              {I18n.get(`richeditor-showfilesresult-${filesRef.current.length > 1 ? 'multiple' : 'single'}title`)}
            </HeadingXSText>
          }
        />
      )}
    </PageView>
  );
}
