import * as React from 'react';
import { Alert, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';

import styles from './styles';
import { RichEditorFormAllProps, UploadFile, UploadStatus } from './types';

import { I18n } from '~/app/i18n';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { ui } from '~/framework/components/inputs/rich-text/editor/const';
import RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';
import RichToolbar from '~/framework/components/inputs/rich-text/toolbar/component';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import ActionButtonBottomSheetModal from '~/framework/components/modals/bottom-sheet/action-button';
import HeaderBottomSheetModal from '~/framework/components/modals/bottom-sheet/header';
import { PageView } from '~/framework/components/page';
import Separator from '~/framework/components/separator';
import usePreventBack from '~/framework/hooks/prevent-back';
import { useSyncRef } from '~/framework/hooks/ref';
import * as authSelectors from '~/framework/modules/auth/redux/selectors';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { ANDROID_15_SDK } from '~/framework/util/permissions';

const OPEN_FILE_IMPORT_TIMEOUT = 500;

const RichEditorForm = React.forwardRef<ScrollView, RichEditorFormAllProps>((props, ref) => {
  const headerHeight = useHeaderHeight();

  const navigation = useNavigation();
  const route = useRoute();

  //
  // Editor management
  //

  const [isFocused, setIsFocused] = React.useState<boolean>(false);

  const richText = React.useRef<RichEditor>(null);

  const blurRichText = () => {
    setIsFocused(false);
  };

  const focusRichText = () => {
    setIsFocused(true);
  };

  //
  // Add files results bottom sheet management
  //

  const hideAddFilesResults = React.useCallback(() => {
    focusRichText();
  }, []);

  const addFile = React.useCallback(
    (toAdd: UploadFile[], idx: number) => {
      if (idx < toAdd.length) {
        const file = toAdd[idx];
        const fileUrl = props.uploadParams.public
          ? `/workspace/pub/document/${file.workspaceID}`
          : `/workspace/document/${file.workspaceID}`;
        richText.current?.insertHTML(
          `<img class="${ui.image.class}" src="${fileUrl}" width="${ui.image.width}" height="${ui.image.height}">`,
        );
        setTimeout(() => {
          addFile(toAdd, idx + 1);
        }, ui.insertElementTimeout);
      } else {
        richText.current?.insertHTML('<br>');
      }
    },
    [props.uploadParams.public],
  );

  const addFiles = React.useCallback(
    (filesToAdd: UploadFile[]) => {
      addFile(
        filesToAdd.filter(file => file.status === UploadStatus.OK),
        0,
      );
      richText.current?.finalizeInsertion();
      richText?.current?.unlockContentEditor();
      hideAddFilesResults();
      richText.current?.focusContentEditor();
    },
    [addFile, hideAddFilesResults],
  );

  const handleAddFiles = React.useCallback(
    (filesToAdd: UploadFile[]) => {
      const nbErrorFiles = filesToAdd.filter(file => file.status === UploadStatus.KO).length;
      if (nbErrorFiles === filesToAdd.length) {
        Alert.alert(I18n.get('richeditor-showfilesresult-canceltitle'), I18n.get('richeditor-showfilesresult-canceltext'), [
          {
            onPress: () => {},
            text: I18n.get('common-cancel'),
          },
          {
            onPress: hideAddFilesResults,
            style: 'destructive',
            text: I18n.get('common-quit'),
          },
        ]);
        return;
      }
      if (nbErrorFiles > 0) {
        Alert.alert(
          I18n.get(
            nbErrorFiles > 1
              ? 'richeditor-showfilesresult-addfileswitherrorstitle'
              : 'richeditor-showfilesresult-addfileswitherrortitle',
          ),
          I18n.get(
            nbErrorFiles > 1
              ? 'richeditor-showfilesresult-addfileswitherrorstext'
              : 'richeditor-showfilesresult-addfileswitherrortext',
            { nb: nbErrorFiles },
          ),
          [
            {
              onPress: () => {},
              text: I18n.get('common-cancel'),
            },
            {
              onPress: () => addFiles(filesToAdd),
              text: I18n.get('common-ok'),
            },
          ],
        );
        return;
      }
      addFiles(filesToAdd);
    },
    [addFiles, hideAddFilesResults],
  );

  React.useEffect(() => {
    // Cf. ToDo about changing typing for Modals nav params
    if (route.params?.importResult?.length > 0) {
      handleAddFiles(route.params!.importResult);
      navigation.setParams({ importResult: undefined });
    }
  }, [route.params?.importResult, handleAddFiles, route.params, navigation]);

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
    richText?.current?.lockContentEditor();
    blurRichText();
    choosePicsMenuRef.current?.present();
  };

  const handleChoosePics = async () => {
    hideChoosePicsMenu();
    setTimeout(() => {
      // ToDo : Modals parma types are enum that prevent type-checking working properly. Use the module route syntax.
      navigation.navigate({
        name: ModalsRouteNames.FileImport,
        params: {
          redirectTo: route,
          source: 'galery',
          uploadParams: props.uploadParams,
        },
      });
    }, OPEN_FILE_IMPORT_TIMEOUT);
  };

  const handleTakePic = async () => {
    hideChoosePicsMenu();
    setTimeout(() => {
      // ToDo : Modals parma types are enum that prevent type-checking working properly. Use the module route syntax.
      navigation.navigate({
        name: ModalsRouteNames.FileImport,
        params: {
          redirectTo: route,
          source: 'camera',
          uploadParams: props.uploadParams,
        },
      });
    }, OPEN_FILE_IMPORT_TIMEOUT);
  };

  const choosePicsMenu = () => {
    return (
      <BottomSheetModal ref={choosePicsMenuRef} onDismiss={handleChoosePicsMenuDismissed}>
        <HeaderBottomSheetModal title={I18n.get('pickfile-image')} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-take')} icon="ui-camera" onPress={handleTakePic} />
        <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.minor} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-pick')} icon="ui-smartphone" onPress={handleChoosePics} />
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
  const scrollSyncRef = useSyncRef(ref, scrollRef);
  const editorSyncRef = props.editorRef ? useSyncRef(props.editorRef, richText) : richText;

  const handleBlur = React.useCallback(() => {
    animateToolbar({ opacity: 0, ypos: 2 * UI_SIZES.elements.editor.toolbarHeight });
    setIsFocused(false);
  }, [animateToolbar]);

  const [isContentModified, setIsContentModified] = React.useState(false);

  const handleChange = React.useCallback(
    (html: string) => {
      props.onChangeText(html);
      if (!isContentModified) setIsContentModified(true);
    },
    [props, isContentModified],
  );

  const handleCursorPosition = React.useCallback((scrollY: number) => {
    scrollRef.current?.scrollTo({ animated: true, y: scrollY - 30 });
  }, []);

  const handleFocus = React.useCallback(() => {
    animateToolbar({ opacity: 1, ypos: UI_SIZES.elements.editor.toolbarHeight });
    setIsFocused(true);
  }, [animateToolbar]);

  usePreventBack({
    showAlert: isContentModified && !props.saving,
    text: I18n.get(props.preventBackI18n?.text ?? 'richeditor-generic-alert-text'),
    title: I18n.get(props.preventBackI18n?.title ?? 'richeditor-generic-alert-title'),
  });

  const { bottomForm, topForm } = props;

  const realTopForm = React.useMemo(
    () =>
      React.isValidElement(topForm) ? topForm : typeof topForm === 'function' ? topForm(() => setIsContentModified(true)) : null,
    [topForm],
  );

  const isAndroid15OrNewer = Platform.OS === 'android' && DeviceInfo.getApiLevelSync() >= ANDROID_15_SDK;

  return (
    <BottomSheetModalProvider>
      <PageView style={styles.page}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={headerHeight}
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : isAndroid15OrNewer ? 'height' : undefined}>
          <ScrollView
            keyboardDismissMode="none"
            keyboardShouldPersistTaps="always"
            ref={scrollSyncRef}
            scrollEventThrottle={20}
            alwaysBounceVertical={false}
            bounces
            style={[styles.scrollView, props.pageStyle]}
            {...props}>
            {realTopForm}
            <RichEditor
              disabled={false}
              enterKeyHint="enter"
              editorStyle={styles.container}
              firstFocusEnd={false}
              initialContentHTML={props.initialContentHtml ?? ''}
              initialFocus={false}
              pasteAsPlainText
              placeholder={props.placeholder ?? ''}
              ref={editorSyncRef}
              style={[styles.richEditor, props.editorStyle]}
              useContainer
              useComposition={false}
              onBlur={handleBlur}
              onChange={handleChange}
              onCursorPosition={handleCursorPosition}
              onFocus={handleFocus}
              autoCorrect
              autoCapitalize
              oneSessionId={props.oneSessionId}
            />
            {bottomForm}
          </ScrollView>
          {isFocused ? toolbar() : null}
          {choosePicsMenu()}
        </KeyboardAvoidingView>
      </PageView>
    </BottomSheetModalProvider>
  );
});

export default connect(
  state => ({
    oneSessionId: authSelectors.oneSessionId(state),
  }),
  null,
  null,
  { forwardRef: true },
)(RichEditorForm);
