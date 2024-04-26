import { useHeaderHeight } from '@react-navigation/elements';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import IconButton from '~/framework/components/buttons/icon';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/list/flat-list';
import { ImagePicked, cameraAction, galleryAction, imagePickedToLocalFile } from '~/framework/components/menus/actions';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, CaptionBoldText, CaptionText, SmallText } from '~/framework/components/text';
import { assertSession } from '~/framework/modules/auth/reducer';
import workspaceService from '~/framework/modules/workspace/service';
import { LocalFile, formatBytes } from '~/framework/util/fileHandler';
import { isEmpty } from '~/framework/util/object';

import RichEditor from './editor/RichEditor';
import styles from './styles';
import RichToolbar from './toolbar/component';
import { RichEditorFormProps, UploadFile, UploadStatus } from './types';

const RichEditorForm = (props: RichEditorFormProps) => {
  const headerHeight = useHeaderHeight();
  const session = assertSession();

  //
  // Editor management
  //

  const richText = React.useRef<RichEditor>(null);

  const focusRichText = () => {
    richText.current?.focusContentEditor();
  };

  //
  // Files management
  //

  let addedFiles: UploadFile[] = [];
  const [files, setFiles] = React.useState<UploadFile[]>([]);

  const resetFiles = () => {
    addedFiles = [];
    setFiles([]);
  };

  const updateFileStatusAndID = ({ index, status, id }: { index: number; status: UploadStatus; id?: string }) => {
    const file = addedFiles[index];
    file.status = status;
    if (id) file.workspaceID = id;
    setFiles([...addedFiles]);
  };

  const uploadFile = ({ file, index }: { file: UploadFile; index: number }) => {
    workspaceService.file
      .uploadFile(session, file.localFile, props.uploadParams)
      .then(resp => {
        updateFileStatusAndID({ index, status: UploadStatus.OK, id: resp.df.id });
      })
      .catch(error => {
        if (__DEV__) console.log(`Rich Editor File Upload Failed: ${error}`);
        updateFileStatusAndID({ index, status: UploadStatus.KO });
      });
  };

  const handleAddPics = async (pics: ImagePicked[]) => {
    addedFiles = pics.map(pic => ({
      localFile: { ...imagePickedToLocalFile(pic), filesize: pic.fileSize } as LocalFile,
      status: UploadStatus.PENDING,
    }));

    addedFiles.forEach((file, index) => uploadFile({ file, index }));
    setFiles([...addedFiles]);
  };

  const handleRemoveFile = async index => {
    if (index >= files.length) return;
    Alert.alert(I18n.get('richeditor-deletefile-title'), I18n.get('richeditor-deletefile-text'), [
      {
        text: I18n.get('common-cancel'),
        onPress: () => {},
      },
      {
        text: I18n.get('common-delete'),
        style: 'destructive',
        onPress: () => {
          const file = files[index];
          const newFiles = [...files];
          if (file.workspaceID === undefined && isEmpty(newFiles)) return hideAddFilesResults();
          if (file.workspaceID === undefined) {
            newFiles.splice(index, 1);
            setFiles(newFiles);
            if (isEmpty(newFiles)) hideAddFilesResults();
            return;
          }
          workspaceService.files
            .trash(session, [file.workspaceID!])
            .then(() => {
              newFiles.splice(index, 1);
              setFiles(newFiles);
              if (isEmpty(newFiles)) hideAddFilesResults();
            })
            .catch(error => {
              if (__DEV__) console.log(`Rich Editor file removal failed: ${error}`);
            });
        },
      },
    ]);
  };

  const handleRetryFile = async index => {
    const file = addedFiles[index];
    uploadFile({ file, index });
  };

  //
  // Add files results bottom sheet management
  //

  const addFilesResultsRef = React.useRef<BottomSheetModalMethods>(null);

  const handleAddFilesResultsDismissed = async () => {
    // TODO V1: Show confirmation box
    workspaceService.files.trash(
      session,
      files.map(f => f.workspaceID!),
    );
    resetFiles();
    focusRichText();
  };

  const hideAddFilesResults = () => {
    addFilesResultsRef.current?.dismiss();
    resetFiles();
    focusRichText();
  };

  const showAddFilesResults = () => {
    addFilesResultsRef.current?.present();
  };

  const handleAddFiles = () => {
    let filesHTML = '';
    files.forEach(file => {
      if (file.status === UploadStatus.OK) {
        filesHTML += `<img class="custom-image" src="/workspace/document/${file.workspaceID}" width="350" height="NaN">`;
      }
    });
    richText.current?.insertHTML(filesHTML);
    hideAddFilesResults();
  };

  const fileStatusIcon = (index: number, status: UploadStatus) => {
    switch (status) {
      case UploadStatus.OK:
        return <IconButton icon="ui-success" color={theme.palette.status.success.regular} />;
      case UploadStatus.KO:
        return <IconButton icon="ui-restore" color={theme.palette.grey.black} action={() => handleRetryFile(index)} />;
      default:
        return <ActivityIndicator size={UI_SIZES.elements.icon.small} color={theme.palette.primary.regular} />;
    }
  };

  const addFilesResults = () => {
    return (
      <BottomSheetModal ref={addFilesResultsRef} onDismiss={handleAddFilesResultsDismissed}>
        <FlatList
          data={files}
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
                  <CaptionBoldText>{I18n.get('richeditor-uploaderror')}</CaptionBoldText>
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
                action={() => handleRemoveFile(index)}
              />
            </View>
          )}
        />
        <PrimaryButton style={styles.addButton} text={`Ajouter (${files.length})`} action={handleAddFiles} />
      </BottomSheetModal>
    );
  };

  //
  // Add pics bottom sheet management
  //

  const choosePicsMenuRef = React.useRef<BottomSheetModalMethods>(null);

  const handleChoosePicsMenuDismissed = () => {
    focusRichText();
  };

  const hideChoosePicsMenu = () => {
    choosePicsMenuRef.current?.dismiss();
  };

  const showChoosePicsMenu = () => {
    choosePicsMenuRef.current?.present();
  };

  const handleChoosePics = async () => {
    hideChoosePicsMenu();
    await galleryAction({ callback: handleAddPics, multiple: true })
      .action({ callbackOnce: true })
      .then(() => {
        showAddFilesResults();
      });
  };

  const handleTakePic = async () => {
    hideChoosePicsMenu();
    await cameraAction({ callback: handleAddPics })
      .action()
      .then(() => {
        showAddFilesResults();
      });
  };

  const choosePicsMenu = () => {
    return (
      <BottomSheetModal ref={choosePicsMenuRef} onDismiss={handleChoosePicsMenuDismissed}>
        <DefaultButton
          iconLeft="ui-image"
          text={I18n.get('pickfile-image')}
          contentColor={theme.palette.complementary.green.regular}
          disabled
          style={styles.choosePicsMenuTitle}
        />
        <TouchableOpacity style={styles.choosePicsMenuElement} onPress={handleTakePic}>
          <NamedSVG
            height={UI_SIZES.elements.icon.default}
            width={UI_SIZES.elements.icon.default}
            name="ui-camera"
            fill={theme.palette.grey.black}
          />
          <BodyText>{I18n.get('pickfile-take')}</BodyText>
        </TouchableOpacity>
        <View style={styles.choosePicsMenuSeparator} />
        <TouchableOpacity style={styles.choosePicsMenuElement} onPress={handleChoosePics}>
          <NamedSVG
            height={UI_SIZES.elements.icon.default}
            width={UI_SIZES.elements.icon.default}
            name="ui-smartphone"
            fill={theme.palette.grey.black}
          />
          <BodyText>{I18n.get('pickfile-pick')}</BodyText>
        </TouchableOpacity>
      </BottomSheetModal>
    );
  };

  //
  // Toolbar management
  //

  const toolbarOpacity = React.useRef(new Animated.Value(0)).current;
  const toolbarYPos = React.useRef(new Animated.Value(90)).current;

  const animateToolbar = React.useCallback(
    ({ opacity, ypos }: { opacity: number; ypos: number }) => {
      Animated.parallel([
        Animated.timing(toolbarOpacity, {
          toValue: opacity,
          ...UI_ANIMATIONS.fade,
        }),
        Animated.timing(toolbarYPos, {
          toValue: ypos,
          ...UI_ANIMATIONS.translate,
        }),
      ]).start();
    },
    [toolbarOpacity, toolbarYPos],
  );

  const toolbar = () => {
    return (
      <Animated.View style={[styles.toolbar, { transform: [{ translateY: toolbarYPos }] }, { opacity: toolbarOpacity }]}>
        <RichToolbar editor={richText} showBottomSheet={showChoosePicsMenu} />
      </Animated.View>
    );
  };

  //
  // Rich Editor management
  //

  const scrollRef = React.useRef<ScrollView>(null);

  const handleBlur = React.useCallback(() => {
    animateToolbar({ opacity: 0, ypos: 2 * UI_SIZES.elements.editor.toolbarHeight });
  }, [animateToolbar]);

  const handleChange = React.useCallback(
    (html: string) => {
      props.onChangeText(html);
    },
    [props],
  );

  const handleCursorPosition = React.useCallback((scrollY: number) => {
    scrollRef.current?.scrollTo({ y: scrollY - 30, animated: true });
  }, []);

  const handleFocus = React.useCallback(() => {
    animateToolbar({ opacity: 1, ypos: UI_SIZES.elements.editor.toolbarHeight });
  }, [animateToolbar]);

  return (
    <PageView style={styles.page}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight}
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardDismissMode="none"
          nestedScrollEnabled
          ref={scrollRef}
          scrollEventThrottle={20}
          bounces={false}
          style={styles.scrollView}>
          {props.topForm}
          <RichEditor
            disabled={false}
            enterKeyHint="done"
            editorStyle={styles.container}
            firstFocusEnd={false}
            initialContentHTML={props.initialContentHtml ?? ''}
            initialFocus={false}
            pasteAsPlainText
            placeholder={I18n.get('blog-createpost-postcontent-placeholder')}
            ref={richText}
            style={styles.richEditor}
            useContainer
            useComposition={false}
            onBlur={handleBlur}
            onChange={handleChange}
            onCursorPosition={handleCursorPosition}
            onFocus={handleFocus}
            autoCorrect
            autoCapitalize
          />
        </ScrollView>
        {toolbar()}
        {choosePicsMenu()}
        {addFilesResults()}
      </KeyboardAvoidingView>
    </PageView>
  );
};

export default RichEditorForm;
