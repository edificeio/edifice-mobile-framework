import { useHeaderHeight } from '@react-navigation/elements';
import * as React from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import IconButton from '~/framework/components/buttons/icon';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { ImagePicked, galleryAction, imagePickedToLocalFile } from '~/framework/components/menus/actions';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, CaptionText, SmallText } from '~/framework/components/text';
import { assertSession } from '~/framework/modules/auth/reducer';
//import workspaceService from '~/framework/modules/workspace/service';
import { LocalFile } from '~/framework/util/fileHandler';

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

  const [files, setFiles] = React.useState<UploadFile[]>([]);

  const updateFileStatus = (index: number, status: UploadStatus) => {
    if (index >= files.length) return;
    const newFiles = files;
    newFiles[index].status = status;
    setFiles(newFiles);
  };

  const addFile = (file: LocalFile) => {
    const filesCount = files.length;
    setFiles(current => [...current, { localFile: file, status: UploadStatus.PENDING }]);
    // TODO V1: Manage file upload
    /*workspaceService.file
      .uploadFile(session, file, props.uploadParams)
      .then(() => {
        updateFileStatus(filesCount, UploadStatus.OK);
      })
      .catch(() => {
        updateFileStatus(filesCount, UploadStatus.KO);
      });*/
  };

  const handleAddPic = async (pic: ImagePicked) => {
    const file = imagePickedToLocalFile(pic);
    file.filesize = pic.fileSize;
    addFile(file);
  };

  const handleRemoveFile = async index => {
    if (index >= files.length) return;
    // TODO V1: Remove following dummy line
    alert('Will remove ' + files[index].localFile.filename + ' - ' + index);
    // TODO V1: Show confirmation box
    // TODO V1: Remove image from WS if needed
    // TODO V1: Remove pic from pics array if needed
    setFiles(files.slice(index, 1)); // TODO LEA: If needed
  };

  const handleRetryFile = async index => {
    // TODO V1: Manage retry
  };

  const resetFiles = () => {
    setFiles([]);
  };

  //
  // Add files results bottom sheet management
  //

  const addFilesResultsRef = React.useRef<BottomSheetModalMethods>(null);

  const handleAddFilesResultsDismissed = async () => {
    // TODO V1: Show confirmation box
    // TODO V1: delete all uploaded files
    resetFiles(); // If needed
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
    // TODO V1: Insert Right HTML info editor for files with status = UploadStatus.OK
    hideAddFilesResults();
  };

  const fileStatusIcon = (index: number, status: UploadStatus) => {
    switch (status) {
      case UploadStatus.OK:
        return <IconButton icon="ui-success" color={theme.palette.status.success.regular} />;
      case UploadStatus.KO:
        return <IconButton icon="ui-restore" color={theme.palette.grey.black} action={() => handleRetryFile(index)} />;
      default:
        return <IconButton icon="ui-loader" color={theme.palette.primary.regular} />;
    }
  };

  const addFilesResults = () => {
    return (
      <BottomSheetModal ref={addFilesResultsRef} onDismiss={handleAddFilesResultsDismissed}>
        {files.map((file, index) => (
          <View key={index} style={styles.addFilesResultsItem}>
            <View style={styles.addFilesResultsType}>
              <NamedSVG
                name="ui-image"
                height={UI_SIZES.elements.icon.small}
                width={UI_SIZES.elements.icon.small}
                fill={theme.palette.grey.black}
              />
            </View>
            <View style={styles.addFilesResultsFile}>
              <SmallText>{file.localFile.filename}</SmallText>
              <CaptionText>
                {file.localFile.filetype} - {file.localFile.filesize} - {file.status}
              </CaptionText>
            </View>
            {fileStatusIcon(index, file.status)}
            <IconButton icon="ui-close" color={theme.palette.grey.black} action={() => handleRemoveFile(index)} />
          </View>
        ))}
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
    await galleryAction({ callback: handleAddPic, multiple: true }).action();
    showAddFilesResults();
  };

  const handleTakePic = async () => {
    // V1 LEA: Implement take picture
    // See if handleAppPic can be used
    alert('TODO LEA');
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
