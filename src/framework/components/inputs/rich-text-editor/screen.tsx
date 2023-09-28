import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { RichEditor, RichToolbar } from '~/framework/components/inputs/rich-text-editor';
import { PageView } from '~/framework/components/page';
import { navBarOptions } from '~/framework/navigation/navBar';
import { isEmpty } from '~/framework/util/object';

import styles from './styles';
import { RichTextEditorMode, RichTextEditorScreenProps } from './types';

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

export const computeNavBar = ({ navigation, route }: NativeStackScreenProps<any>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: 'editor',
  }),
});

export default function RichTextEditorScreen(props: RichTextEditorScreenProps) {
  const [emojiDuration, setEmojiDuration] = useState(240); // iOS Default
  const [pageHeight, setPageHeight] = useState(257); // iOS Default
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [itemsSelected, setItemsSelected] = useState([]);

  const contentRef = useRef('');
  const headerHeight = useHeaderHeight();
  const richText = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);

  const translateAnim = useRef(new Animated.Value(pageHeight)).current;
  const [showToolbarPage, setShowToolbarPage] = useState(false);

  useEffect(() => {
    if (showToolbarPage) {
      setTimeout(() => {
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 50);
    }
    if (!showToolbarPage) {
      setTimeout(() => {
        Animated.timing(translateAnim, {
          toValue: pageHeight,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToolbarPage]);

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  const getContent = () => contentRef.current;

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
    console.log('editor focus', itemsSelected);
    if (!isEmpty(itemsSelected)) {
      itemsSelected.forEach(action => richText.current?.sendAction(action, 'result'));
    }
    if (showToolbarPage) setShowToolbarPage(false);
  }, [itemsSelected, showToolbarPage]);

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

  const onSelectAction = useCallback(
    action => {
      if (itemsSelected.includes(action)) {
        const newArray = itemsSelected.filter(act => act !== action);
        setItemsSelected(newArray);
      } else {
        setItemsSelected([...itemsSelected, action]);
        setTimeout(() => {
          Keyboard.dismiss();
          richText.current?.blurContentEditor();
          setShowToolbarPage(true);
        }, 300);
      }
    },
    [itemsSelected],
  );

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

  const renderToolbar = () => {
    return (
      <Animated.View
        style={{
          // borderColor: 'blue',
          // borderWidth: 1,
          transform: [{ translateY: translateAnim }],
          marginTop: -pageHeight,
        }}>
        <RichToolbar
          actions={['text-size']}
          memoActionsSelected={itemsSelected}
          disabledIconTint="#bfbfbf"
          editor={richText}
          selectedIconTint="#2095F2"
          style={styles.richBar}
          foreColor={handleForeColor}
          fontSize={handleFontSize}
          hiliteColor={handleHiliteColor}
          insertEmoji={handleEmoji}
          onInsertLink={onInsertLink}
          onPressAddImage={onPressAddImage}
          onSelectAction={onSelectAction}
          heightPageToolbar={pageHeight}
          disabled={props.route.params.mode !== RichTextEditorMode.ENABLED}
        />
      </Animated.View>
    );
  };

  return (
    <PageView>
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight}
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardDismissMode="none" nestedScrollEnabled ref={scrollRef} scrollEventThrottle={20} style={styles.scroll}>
          <RichEditor
            disabled={props.route.params.mode !== RichTextEditorMode.ENABLED}
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
        {props.route.params.mode !== RichTextEditorMode.PREVIEW ? renderToolbar() : null}
      </KeyboardAvoidingView>
    </PageView>
  );
}
