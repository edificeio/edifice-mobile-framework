import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';
import { ui } from '~/framework/components/inputs/rich-text/editor/const';
import RichToolbar from '~/framework/components/inputs/rich-text/toolbar/component';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import usePreventBack from '~/framework/hooks/prevent-back';
import * as authSelectors from '~/framework/modules/auth/redux/selectors';
import { ModalsRouteNames } from '~/framework/navigation/modals';

import styles from './styles';
import { RichEditorFormAllProps, UploadFile, UploadStatus } from './types';

const OPEN_FILE_IMPORT_TIMEOUT = 500;

const RichEditorForm = (props: RichEditorFormAllProps) => {
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

  const addFile = React.useCallback((toAdd: UploadFile[], idx: number) => {
    if (idx < toAdd.length) {
      const file = toAdd[idx];
      richText.current?.insertHTML(
        `<img class="${ui.image.class}" src="/workspace/document/${file.workspaceID}" width="${ui.image.width}" height="${ui.image.height}">`,
      );
      setTimeout(() => {
        addFile(toAdd, idx + 1);
      }, ui.insertElementTimeout);
    } else {
      richText.current?.insertHTML('<br>');
    }
  }, []);

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
            text: I18n.get('common-cancel'),
            onPress: () => {},
          },
          {
            text: I18n.get('common-quit'),
            style: 'destructive',
            onPress: hideAddFilesResults,
          },
        ]);
        return;
      }
      if (nbErrorFiles > 0) {
        Alert.alert(
          I18n.get(`richeditor-showfilesresult-addfileswitherror${nbErrorFiles > 1 ? 's' : ''}title`),
          I18n.get(`richeditor-showfilesresult-addfileswitherror${nbErrorFiles > 1 ? 's' : ''}text`, { nb: nbErrorFiles }),
          [
            {
              text: I18n.get('common-cancel'),
              onPress: () => {},
            },
            {
              text: I18n.get('common-ok'),
              onPress: () => addFiles(filesToAdd),
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
          uploadParams: props.uploadParams,
          redirectTo: route,
          source: 'galery',
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
          uploadParams: props.uploadParams,
          redirectTo: route,
          source: 'camera',
        },
      });
    }, OPEN_FILE_IMPORT_TIMEOUT);
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
    scrollRef.current?.scrollTo({ y: scrollY - 30, animated: true });
  }, []);

  const handleFocus = React.useCallback(() => {
    animateToolbar({ opacity: 1, ypos: UI_SIZES.elements.editor.toolbarHeight });
    setIsFocused(true);
  }, [animateToolbar]);

  usePreventBack({
    title: I18n.get(props.preventBackI18n?.title ?? 'richeditor-generic-alert-title'),
    text: I18n.get(props.preventBackI18n?.text ?? 'richeditor-generic-alert-text'),
    showAlert: isContentModified && !props.saving,
  });

  const { topForm } = props;

  const realTopForm = React.useMemo(
    () =>
      React.isValidElement(topForm) ? topForm : typeof topForm === 'function' ? topForm(() => setIsContentModified(true)) : null,
    [topForm],
  );

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
          alwaysBounceVertical={false}
          bounces
          style={styles.scrollView}>
          {realTopForm}
          <RichEditor
            disabled={false}
            enterKeyHint="enter"
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
            oneSessionId={props.oneSessionId}
          />
        </ScrollView>
        {isFocused ? toolbar() : null}
        {choosePicsMenu()}
      </KeyboardAvoidingView>
    </PageView>
  );
};

export default connect(state => ({
  oneSessionId: authSelectors.oneSessionId(state),
}))(RichEditorForm);
