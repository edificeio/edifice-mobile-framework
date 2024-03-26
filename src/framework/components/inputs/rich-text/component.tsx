import { useHeaderHeight } from '@react-navigation/elements';
import * as React from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { UI_SIZES } from '~/framework/components/constants';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';

import RichEditor from './editor/RichEditor';
import styles from './styles';
import RichToolbar from './toolbar/component';
import { RichEditorFormProps } from './types';

const RichEditorForm = (props: RichEditorFormProps) => {
  const headerHeight = useHeaderHeight();
  const richText = React.useRef<RichEditor>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const opacityToolbar = React.useRef(new Animated.Value(0)).current;
  const transformToolbar = React.useRef(new Animated.Value(90)).current;
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);

  const handleBlur = React.useCallback(() => {
    Animated.timing(opacityToolbar, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(transformToolbar, {
      toValue: 90,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [opacityToolbar, transformToolbar]);

  const handleChange = React.useCallback(
    (html: string) => {
      props.onChangeText(html);
    },
    [props],
  );

  const handleCursorPosition = React.useCallback((scrollY: number) => {
    // Positioning scroll bar
    scrollRef.current!.scrollTo({ y: scrollY - 30, animated: true });
  }, []);

  const handleFocus = React.useCallback(() => {
    console.log('editor focus');
    Animated.timing(opacityToolbar, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(transformToolbar, {
      toValue: 45,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [opacityToolbar, transformToolbar]);

  const showBottomSheet = () => {
    bottomSheetModalRef.current?.present();
  };

  const renderBottomSheet = () => {
    return (
      <BottomSheetModal ref={bottomSheetModalRef} onDismiss={() => {}}>
        <DefaultButton
          iconLeft="ui-image"
          text={I18n.get('pickfile-image')}
          contentColor={theme.palette.complementary.green.regular}
          disabled
        />
        <TouchableOpacity onPress={() => {}}>
          <NamedSVG
            height={UI_SIZES.elements.icon.default}
            width={UI_SIZES.elements.icon.default}
            name="ui-camera"
            fill={theme.palette.grey.black}
          />
          <BodyText>{I18n.get('pickfile-take')}</BodyText>
        </TouchableOpacity>
        <View />
        <TouchableOpacity onPress={() => {}}>
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

  const renderToolbar = () => {
    return (
      <Animated.View style={{ transform: [{ translateY: transformToolbar }], opacity: opacityToolbar, marginTop: -45 }}>
        <RichToolbar editor={richText} showBottomSheet={showBottomSheet} />
      </Animated.View>
    );
  };

  // TODO: LEA => Pourquoi ne pas mettre ça dans render direct? En plus Post, c'est blog.
  const renderPostInfos = () => {
    return (
      <PageView style={styles.page}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={headerHeight}
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardDismissMode="none" nestedScrollEnabled ref={scrollRef} scrollEventThrottle={20} style={styles.scroll}>
            {props.elements}
            <RichEditor
              disabled={false}
              enterKeyHint="done"
              editorStyle={styles.content} // TODO: LEA => c'est pas container?
              firstFocusEnd={false}
              initialContentHTML={props.initialContentHtml ?? ''}
              initialFocus={false}
              pasteAsPlainText
              placeholder={I18n.get('editor-new-placeholder')}
              ref={richText}
              style={styles.rich}
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
          {renderToolbar()}
          {renderBottomSheet()}
        </KeyboardAvoidingView>
      </PageView>
    );
  };

  return <>{renderPostInfos()}</>;
};

export default RichEditorForm;
