import * as React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { ImportQueueScreenProps, UploadStatus, UploadTask, UploadTaskDone, UploadTaskFailed, UploadTaskToDo } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { WithModalPromise } from '~/framework/components/modals/provider';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import { CaptionBoldText, SmallText } from '~/framework/components/text';
import usePreventBack from '~/framework/hooks/prevent-back';
import { getSession } from '~/framework/modules/auth/reducer';
import workspaceService from '~/framework/modules/workspace/service';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import { Image, IMedia } from '~/framework/util/media';

const headerTitleStyle = {
  color: theme.palette.grey.darkness.toString(),
};

export const computeNavBar: ImportQueueScreenProps.NavBarConfig = ({ navigation, route }) => ({
  presentation: 'modal',
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('import-title'),
  }),
  headerStyle: {
    backgroundColor: theme.ui.background.page.toString(),
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

const formatTask = (file: LocalFile) =>
  ({
    file,
    status: UploadStatus.IDLE,
  }) as UploadTaskToDo;

const textErrorUploadFile: (error) => string = error => {
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

const MAX_PARALLEL_UPLOADS_TASKS = 6;

export default WithModalPromise<IMedia[], ImportQueueScreenProps.PromiseData, ImportQueueScreenProps.AllProps>(
  function FileImportScreen(props) {
    const {
      modalPromiseData: { files, uploadFn },
      navigation,
      rejectModalPromise,
      resolveModalPromise,
      route,
    } = props;
    const session = getSession();

    // Allows exit the screen without confirmation prompt.
    const [allFilesImported, setAllFilesImported] = React.useState(false);

    // The list of files to import and their import status
    const uploadTasksRef = React.useRef<UploadTask[]>(files ? files.map(formatTask) : []);
    // The bucket of allowed simultaneous uploading processes.
    const uploadingTasksRef = React.useRef<Set<UploadTask>>(new Set());

    // Arbitrary value that forces the list to update
    const [uploadTaskNumber, setUploadTaskNumber] = React.useState(0);

    const updateTaskStatusAndID = React.useCallback(
      (task: UploadTask, { error, file, status }: { status: UploadStatus; file?: SyncedFileWithId; error?: string }) => {
        task.status = status;
        if (file) (task as UploadTaskDone).file = file;
        if (error) (task as UploadTaskFailed).error = error;
        setUploadTaskNumber(val => val + 1); // Update view
      },
      [],
    );

    const startUploadTask = React.useCallback(
      (task: UploadTask) => {
        if (task.status === UploadStatus.PENDING || task.status === UploadStatus.OK) return;
        if (!session) {
          updateTaskStatusAndID(task, { status: UploadStatus.KO });
          return;
        }
        uploadingTasksRef.current.add(task);
        updateTaskStatusAndID(task, { status: UploadStatus.PENDING });
        uploadFn(task.file)
          .then(resp => {
            updateTaskStatusAndID(task, { file: resp, status: UploadStatus.OK });
          })
          .catch(error => {
            console.error(`Import File Upload Failed: ${error}`);
            updateTaskStatusAndID(task, { error: textErrorUploadFile(error), status: UploadStatus.KO });
          })
          .finally(() => {
            uploadingTasksRef.current.delete(task);
          });
      },
      [session, updateTaskStatusAndID, uploadFn],
    );

    const uploadRemainingFiles = React.useCallback(() => {
      for (let i = 0; i < uploadTasksRef.current.length; ++i) {
        if (uploadingTasksRef.current.size >= MAX_PARALLEL_UPLOADS_TASKS) break;
        const task = uploadTasksRef.current[i];
        if (task.status !== UploadStatus.IDLE) continue;
        startUploadTask(task);
      }
    }, [startUploadTask]);

    const updateTasks = React.useCallback(
      (tasks: ReturnType<typeof formatTask>[]) => {
        if (tasks.length === 0) {
          navigation.goBack();
          return;
        }
        uploadTasksRef.current = tasks;
        setUploadTaskNumber(val => val + 1);
        uploadRemainingFiles();
      },
      [uploadRemainingFiles, navigation],
    );

    const removeAllFiles = React.useCallback(() => {
      workspaceService.files.trash(
        session!,
        uploadTasksRef.current.reduce<string[]>((acc, task) => {
          if (task.status === UploadStatus.OK) acc.push(task.file.id);
          return acc;
        }, []),
      );
      resolveModalPromise([]);
    }, [resolveModalPromise, session]);

    usePreventBack({
      actionOnBack: removeAllFiles,
      showAlert: uploadTasksRef.current.length > 0 && !allFilesImported,
      text: I18n.get('import-back-confirm-text'),
      title: I18n.get('import-back-confirm-title'),
    });

    // Manage nav bar actions
    React.useEffect(() => {
      const fileCount = uploadTasksRef.current.length;
      navigation.setOptions({
        // navigation.setOptions() requires to define the component on demand.
        headerRight: () =>
          uploadTasksRef.current.some(upload => upload.status === UploadStatus.PENDING) ? (
            <ActivityIndicator size={UI_SIZES.elements.navbarIconSize} color={theme.palette.grey.black} />
          ) : (
            <NavBarAction
              title={I18n.get('import-confirm-button', {
                count: uploadTasksRef.current.filter(f => f.status === UploadStatus.OK).length,
              })}
              titleStyle={{ color: theme.palette.grey.darkness }}
              onPress={() => {
                setAllFilesImported(true);
              }}
              disabled={
                !uploadTaskNumber ||
                (fileCount > 0 &&
                  uploadTasksRef.current.some(
                    f => f.status === UploadStatus.PENDING || f.status === UploadStatus.IDLE || f.status === UploadStatus.KO,
                  ))
              }
            />
          ),
        headerTitle:
          fileCount === 0
            ? navBarTitle(I18n.get('import-title_zero'), headerTitleStyle)
            : navBarTitle(I18n.get('import-title_other', { count: fileCount }), headerTitleStyle),
      });
    }, [navigation, uploadTaskNumber]);

    React.useEffect(() => {
      if (allFilesImported) {
        navigation.navigate(route.params.redirectTo.name, {
          ...route.params.redirectTo.params,
          importResult: uploadTasksRef.current.map(f => ({
            status: f.status,
            workspaceID: f.workspaceID,
          })),
        });
      }
    }, [allFilesImported, navigation, route]);

    React.useEffect(() => {
      if (uploadTasksRef.current.length === 0 && uploadTaskNumber) {
        navigation.goBack();
      }
    }, [uploadTaskNumber, navigation]);

    // Refresh remaining tasks everytime a file has been handled.
    React.useEffect(() => {
      if (uploadTaskNumber) {
        uploadRemainingFiles();
      }
    }, [uploadTaskNumber, uploadRemainingFiles]);

    const removeFile = React.useCallback(
      async (index: number) => {
        if (!session) return;
        if (index >= uploadTasksRef.current.length) return;
        Alert.alert(I18n.get('richeditor-showfilesresult-deletefiletitle'), I18n.get('richeditor-showfilesresult-deletefiletext'), [
          {
            onPress: () => {},
            text: I18n.get('common-cancel'),
          },
          {
            onPress: () => {
              const file = uploadTasksRef.current[index];
              if (file.workspaceID === undefined) {
                updateTasks(uploadTasksRef.current.filter((_, i) => i !== index));
              } else {
                workspaceService.files
                  .trash(session, [file.workspaceID!])
                  .then(() => {
                    updateTasks(uploadTasksRef.current.filter((_, i) => i !== index));
                  })
                  .catch(error => {
                    console.error(`Rich Editor file removal failed: ${error}`);
                  });
              }
            },
            style: 'destructive',
            text: I18n.get('common-delete'),
          },
        ]);
      },
      [session, updateTasks],
    );

    const retryFile = async (index: number) => {
      const file = uploadTasksRef.current[index];
      file.status = UploadStatus.PENDING;
      startUploadTask(file, index);
    };

    const fileStatusIcon = (index: number, status: UploadStatus) => {
      switch (status) {
        case UploadStatus.OK:
          return <IconButton icon="ui-success" color={theme.palette.status.success.regular} />;
        case UploadStatus.KO:
          return <IconButton icon="ui-restore" color={theme.palette.status.failure.regular} action={() => retryFile(index)} />;
        case UploadStatus.PENDING:
          return <ActivityIndicator size={UI_SIZES.elements.icon.small} color={theme.palette.primary.regular} />;
        default:
          return null;
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
          <Svg
            name={file.status === UploadStatus.KO ? 'ui-error' : 'ui-image'}
            height={UI_SIZES.elements.icon.small}
            width={UI_SIZES.elements.icon.small}
            fill={file.status === UploadStatus.KO ? theme.palette.status.failure.regular : theme.palette.grey.black}
          />
        </View>
      );
    };

    React.useEffect(() => {
      return () => {
        resolveModalPromise([]);
      };
    }, []);

    if (!session) return <EmptyContentScreen />;

    return (
      <PageView>
        {!uploadTaskNumber ? (
          renderPlaceholder()
        ) : (
          <FlatList
            data={uploadTasksRef.current}
            contentContainerStyle={styles.addFilesResults}
            alwaysBounceVertical={false}
            renderItem={({ index, item }) => (
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
          />
        )}
      </PageView>
    );
  },
);
