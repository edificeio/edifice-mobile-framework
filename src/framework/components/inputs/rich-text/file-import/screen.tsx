import * as React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { UploadFile, UploadStatus } from '~/framework/components/inputs/rich-text/form/types';
import FlatList from '~/framework/components/list/flat-list';
import { imagePickedToLocalFile } from '~/framework/components/menus/actions';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { CaptionBoldText, CaptionText, HeadingXSText, SmallText } from '~/framework/components/text';
import usePreventBack from '~/framework/hooks/prevent-back';
import { getSession } from '~/framework/modules/auth/reducer';
import workspaceService from '~/framework/modules/workspace/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile, formatBytes } from '~/framework/util/fileHandler';

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

export default function FileImportScreen(props: FileImportScreenProps.AllProps) {
  const { navigation, route } = props;
  const session = getSession();

  const [validateImport, setValidateImport] = React.useState(false);

  const [files, setFiles] = React.useState(
    route.params.files.map(pic => ({
      localFile: { ...imagePickedToLocalFile(pic), filesize: pic.fileSize } as LocalFile,
      status: UploadStatus.PENDING,
      error: undefined as string | undefined,
      workspaceID: undefined as string | undefined,
    })),
  );

  const updateFileStatusAndID = React.useCallback(
    ({ index, status, id, error }: { index: number; status: UploadStatus; id?: string; error?: string }) => {
      const file = files[index];
      file.status = status;
      if (id) file.workspaceID = id;
      if (error) file.error = error;
      setFiles([...files]);
    },
    [files],
  );

  usePreventBack({
    title: I18n.get('import-back-confirm-title'),
    text: I18n.get('import-back-confirm-text'),
    showAlert: files.length > 0 && !validateImport,
  });

  const textErrorUploadFile: (error) => string = error => {
    switch (error) {
      case '{"error":"file.too.large"}':
        return I18n.get('import-error-filetoolarge');
      default:
        return I18n.get('import-uploaderror');
    }
  };

  const uploadFile = React.useCallback(
    ({ file, index }: { file: UploadFile; index: number }) => {
      if (!session) {
        updateFileStatusAndID({ index, status: UploadStatus.KO });
        return;
      }
      workspaceService.file
        .uploadFile(session, file.localFile, route.params.uploadParams)
        .then(resp => {
          updateFileStatusAndID({ index, status: UploadStatus.OK, id: resp.df.id });
        })
        .catch(error => {
          console.debug(`Import File Upload Failed: ${error}`);
          updateFileStatusAndID({ index, status: UploadStatus.KO, error: textErrorUploadFile(error.response?.body) });
        });
    },
    [route.params.uploadParams, session, updateFileStatusAndID],
  );

  // Manage nav bar actions
  React.useEffect(() => {
    navigation.setOptions({
      // navigation.setOptions() requires to define the component on demand.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <NavBarAction
          title={I18n.get('import-confirm-button', { count: files.length })}
          onPress={() => {
            setValidateImport(true);
          }}
          disabled={files.length > 0 && files.some(f => f.status === UploadStatus.PENDING)}
        />
      ),
    });
  }, [navigation, files]);

  React.useEffect(() => {
    files.forEach((file, index) => uploadFile({ file, index }));
    // This method is executed only when component is mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (validateImport) {
      navigation.navigate(route.params.redirectTo.name, {
        ...route.params.redirectTo.params,
        importResult: files.map(f => ({
          status: f.status,
          workspaceID: f.workspaceID,
        })),
      });
    }
  }, [validateImport, navigation, route, files]);

  React.useEffect(() => {
    if (files.length === 0) {
      navigation.goBack();
    }
  }, [files.length, navigation]);

  const removeFile = React.useCallback(
    async (index: number) => {
      if (!session) return;
      if (index >= files.length) return;
      Alert.alert(I18n.get('richeditor-showfilesresult-deletefiletitle'), I18n.get('richeditor-showfilesresult-deletefiletext'), [
        {
          text: I18n.get('common-cancel'),
          onPress: () => {},
        },
        {
          text: I18n.get('common-delete'),
          style: 'destructive',
          onPress: () => {
            const file = files[index];
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
    [files, session],
  );

  const retryFile = async (index: number) => {
    const file = files[index];
    file.status = UploadStatus.PENDING;
    setFiles([...files]);
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

  if (!session) return <EmptyContentScreen />;

  return (
    <PageView>
      <FlatList
        data={files}
        contentContainerStyle={styles.addFilesResults}
        alwaysBounceVertical={false}
        renderItem={({ item, index }) => (
          <View key={index} style={styles.addFilesResultsItem}>
            <View
              style={[
                styles.addFilesResultsType,
                {
                  backgroundColor:
                    item.status === UploadStatus.KO ? theme.palette.status.failure.pale : theme.palette.complementary.green.pale,
                },
              ]}>
              <NamedSVG
                name={item.status === UploadStatus.KO ? 'ui-error' : 'ui-image'}
                height={UI_SIZES.elements.icon.small}
                width={UI_SIZES.elements.icon.small}
                fill={item.status === UploadStatus.KO ? theme.palette.status.failure.regular : theme.palette.grey.black}
              />
            </View>
            <View style={styles.addFilesResultsFile}>
              <SmallText>{item.localFile.filename}</SmallText>
              {item.status === UploadStatus.KO ? (
                <CaptionBoldText>{item.error}</CaptionBoldText>
              ) : (
                <CaptionText>
                  {item.localFile.filetype} - {formatBytes(item.localFile.filesize)}
                </CaptionText>
              )}
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
            {files.length} {I18n.get(`richeditor-showfilesresult-${files.length > 1 ? 'multiple' : 'single'}title`)}
          </HeadingXSText>
        }
      />
    </PageView>
  );
}
