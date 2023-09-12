import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { RichEditor, RichToolbar, actions } from '~/framework/components/inputs/rich-text-editor';
import { PageView } from '~/framework/components/page';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';

type FontSize = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type IconRecord = {
  selected: boolean;
  disabled: boolean;
  tintColor: any;
  iconSize: number;
};

const imageList = [
  'https://img.lesmao.vip/k/h256/R/MeiTu/1293.jpg',
  'https://pbs.twimg.com/profile_images/1242293847918391296/6uUsvfJZ.png',
  'https://img.lesmao.vip/k/h256/R/MeiTu/1297.jpg',
  'https://img.lesmao.vip/k/h256/R/MeiTu/1292.jpg',
];

//const htmlIcon = require('~/framework/components/inputs/rich-text/img/html.png');
const phizIcon = require('~/framework/components/inputs/rich-text-editor/img/indent.png');

const styles = StyleSheet.create({
  container: {
    marginBottom: UI_SIZES.screen.bottomInset,
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    backgroundColor: 'white',
    color: 'black',
    caretColor: 'red',
    placeholderColor: 'gray',
    contentCSSText: 'font-size: 16px; min-height: 200px;',
  },
  flatStyle: {
    paddingHorizontal: 12,
  },
  rich: {
    minHeight: 300,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e3e3e3',
  },
  richBar: {
    borderColor: '#efefef',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  tib: {
    textAlign: 'center',
    color: 'green',
  },
});

export const computeNavBar = ({ navigation, route }: NativeStackScreenProps<any>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: 'editor',
  }),
});

export default function EditorEditScreen(props) {
  const [data, setData] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [emojiDuration, setEmojiDuration] = useState(240); // iOS Default
  const [pageHeight, setPageHeight] = useState(291); // iOS Default
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [error, setError] = useState(false);

  const contentRef = useRef('');
  const headerHeight = useHeaderHeight();
  const richText = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);

  const translateAnim = useRef(new Animated.Value(pageHeight)).current;
  const [showToolbarPage, setShowToolbarPage] = useState(false);

  useEffect(() => {
    console.log('showToolbarPage', showToolbarPage);
    if (showToolbarPage) {
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    if (!showToolbarPage) {
      Animated.timing(translateAnim, {
        toValue: pageHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToolbarPage]);

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  //
  // Rich text editor states, events && callbacks
  //

  const editorInitializedCallback = useCallback(() => {
    // alert('Editor initialized');
  }, []);

  const handleBlur = useCallback(() => {
    console.log('editor blur');
  }, []);

  const handleChange = useCallback((html: string) => {
    contentRef.current = html;
  }, []);

  const handleCursorPosition = useCallback((scrollY: number) => {
    // Positioning scroll bar
    scrollRef.current!.scrollTo({ y: scrollY - 30, animated: true });
  }, []);

  const handleEmoji = useCallback(() => {
    Keyboard.dismiss();
    richText.current?.blurContentEditor();
    setEmojiVisible(true);
  }, []);

  const handleFocus = useCallback(() => {
    console.log('editor focus');
    setShowToolbarPage(false);
  }, []);

  const handleFontSize = useCallback(() => {
    // 1=  10px, 2 = 13px, 3 = 16px, 4 = 18px, 5 = 24px, 6 = 32px, 7 = 48px;
    const size = [1, 2, 3, 4, 5, 6, 7];
    richText.current?.setFontSize(size[getRandomInt(size.length - 1)] as FontSize);
  }, []);

  const handleForeColor = useCallback(() => {
    richText.current?.setForeColor('blue');
  }, []);

  const handleHiliteColor = useCallback(() => {
    richText.current?.setHiliteColor('red');
  }, []);

  const handleHeightChange = useCallback((height: number) => {
    console.log('editor height change:', height);
  }, []);

  const handleInput = useCallback(() => {
    // console.log(inputType, data)
  }, []);

  const handleInsertEmoji = useCallback((emoji: string) => {
    richText.current?.insertText(emoji);
    richText.current?.blurContentEditor();
    setEmojiVisible(false);
  }, []);

  const handleMessage = useCallback(({ type, id, msg }: { type: string; id: string; msg?: any }) => {
    switch (type) {
      case 'ImgClick':
        richText.current?.commandDOM(`$('#${id}').src="${imageList[getRandomInt(imageList.length - 1)]}"`);
        break;
      case 'TitleClick':
        // eslint-disable-next-line no-case-declarations
        const color = ['red', 'blue', 'gray', 'yellow', 'coral'];
        richText.current?.commandDOM(`$('#${id}').style.color='${color[getRandomInt(color.length - 1)]}'`);
        break;
      case 'SwitchImage':
        break;
    }
    console.log('onMessage', type, id, msg);
  }, []);

  const handlePaste = useCallback((text: any) => {
    alert(`Paste: ${text}`);
  }, []);

  const onInsertLink = useCallback(() => {
    alert('Not implemented yet, but possible...');
  }, []);

  const onPressAddImage = useCallback(() => {
    richText.current?.insertImage(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png',
      'background: gray;',
    );
  }, []);

  const onSelectItemToolbar = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => {
      richText.current?.blurContentEditor();
      setShowToolbarPage(true);
    }, 200);
  }, []);

  //
  // Keyboard Management
  //

  const handleKeyboardHide = useCallback(() => {}, []);

  const handleKeyboardShow = useCallback(event => {
    setEmojiDuration(event?.duration);
    // As event?.endCoordinates?.height returns a wrong value on Android,
    // We must calculate keyboard height differently
    const height = Dimensions.get('screen').height;
    setPageHeight(height - event?.endCoordinates?.screenY - Platform.select({ ios: UI_SIZES.screen.bottomInset, default: 0 }));
    setEmojiVisible(false);
  }, []);

  useEffect(() => {
    const listeners = [
      Keyboard.addListener('keyboardDidShow', handleKeyboardShow),
      Keyboard.addListener('keyboardDidHide', handleKeyboardHide),
    ];
    return () => {
      listeners.forEach(it => it.remove());
    };
  }, [handleKeyboardHide, handleKeyboardShow]);

  //
  // Display error screen
  //

  if (error)
    return (
      <PageView style={{ alignItems: 'center' }}>
        <BodyBoldText style={{ marginTop: 20, textAlign: 'center' }}>¡¡¡ ERROR FETCHING DATA !!!</BodyBoldText>
        <BodyText style={{ marginTop: 20, textAlign: 'center' }}>
          Make sure that the VPN is connected and check Your connection.
        </BodyText>
        <PrimaryButton
          action={() => {
            contentRef.current = '';
            setData('');
            setError(false);
          }}
          style={{ marginTop: 20 }}
          text="RETRY"
        />
      </PageView>
    );

  const renderToolbar = () => {
    if (disabled) return null;
    return (
      <Animated.View
        style={{
          borderColor: 'blue',
          borderWidth: 1,
          transform: [{ translateY: translateAnim }],
          marginTop: -pageHeight,
        }}>
        <RichToolbar
          actions={[
            actions.undo,
            actions.redo,
            'insertEmoji',
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            'fontSize',
            actions.alignLeft,
            actions.alignCenter,
            actions.alignRight,
            actions.removeFormat,
            actions.insertBulletsList,
            actions.indent,
            actions.outdent,
            actions.insertLink,
            actions.line,
            actions.foreColor,
            actions.hiliteColor,
            actions.heading1,
            actions.heading4,
            actions.code,
            actions.setStrikethrough,
            actions.insertOrderedList,
            actions.blockquote,
          ]}
          disabled={false}
          disabledIconTint="#bfbfbf"
          editor={richText}
          flatContainerStyle={styles.flatStyle}
          iconMap={{
            insertEmoji: phizIcon,
            [actions.foreColor]: () => <Text style={[styles.tib, { color: 'blue' }]}>FC</Text>,
            [actions.hiliteColor]: ({ tintColor }: IconRecord) => (
              <Text style={[styles.tib, { color: tintColor, backgroundColor: 'red' }]}>BC</Text>
            ),
            [actions.heading1]: ({ tintColor }: IconRecord) => <Text style={[styles.tib, { color: tintColor }]}>H1</Text>,
            [actions.heading4]: ({ tintColor }: IconRecord) => <Text style={[styles.tib, { color: tintColor }]}>H4</Text>,
            //insertHTML: htmlIcon,
          }}
          selectedIconTint="#2095F2"
          style={styles.richBar}
          foreColor={handleForeColor}
          fontSize={handleFontSize}
          hiliteColor={handleHiliteColor}
          insertEmoji={handleEmoji}
          onInsertLink={onInsertLink}
          onPressAddImage={onPressAddImage}
          onSelectItem={onSelectItemToolbar}
          heightPageToolbar={pageHeight}
        />
      </Animated.View>
    );
  };

  return (
    <PageView>
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight}
        style={[styles.container, { backgroundColor: disabled ? 'white' : '#bfbfbf' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardDismissMode="none" nestedScrollEnabled ref={scrollRef} scrollEventThrottle={20} style={styles.scroll}>
          <RichEditor
            disabled={disabled}
            enterKeyHint="done"
            editorStyle={styles.content}
            firstFocusEnd={false}
            initialContentHTML=""
            initialFocus={false}
            pasteAsPlainText
            placeholder="please input content"
            ref={richText}
            style={styles.rich}
            useContainer
            editorInitializedCallback={editorInitializedCallback}
            onBlur={handleBlur}
            onChange={handleChange}
            onCursorPosition={handleCursorPosition}
            onFocus={handleFocus}
            onHeightChange={handleHeightChange}
            onInput={handleInput}
            onMessage={handleMessage}
            onPaste={handlePaste}
          />
        </ScrollView>
        {renderToolbar()}
      </KeyboardAvoidingView>
    </PageView>
  );
}
