import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';

import { RichEditor, RichToolbar } from '~/framework/components/inputs/rich-text-editor';
import { PageView } from '~/framework/components/page';
import { navBarOptions } from '~/framework/navigation/navBar';

import { NavBarAction } from '../../navigation';
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

export const computeNavBar = ({ navigation, route }: NativeStackScreenProps<any>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: 'Nouveau billet',
  }),
});

export default function RichTextEditorScreen(props: RichTextEditorScreenProps) {
  const contentRef = useRef('');
  const headerHeight = useHeaderHeight();
  const richText = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);
  const opacityToolbar = useRef(new Animated.Value(0)).current;
  const transformToolbar = useRef(new Animated.Value(90)).current;

  const getContent = () => contentRef.current;

  //
  // Rich text editor states, events && callbacks
  //

  const editorInitializedCallback = useCallback(() => {
    // alert('Editor initialized');
  }, []);

  const handleBlur = useCallback(() => {
    console.log('editor blur');
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

  const handleChange = useCallback((html: string) => {
    contentRef.current = html;
  }, []);

  const handleCursorPosition = useCallback((scrollY: number) => {
    // Positioning scroll bar
    scrollRef.current!.scrollTo({ y: scrollY - 30, animated: true });
  }, []);

  const handleFocus = useCallback(() => {
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

  const handleHeightChange = useCallback((height: number) => {
    console.log('editor height change:', height);
  }, []);

  const handleInput = useCallback(() => {
    // console.log(inputType, data)
  }, []);

  //
  // Keyboard Management
  //

  const handleKeyboardHide = useCallback(() => {}, []);

  const handleKeyboardShow = useCallback(event => {
    console.log(event?.duration, 'duration keyboard');
    // As event?.endCoordinates?.height returns a wrong value on Android,
    // We must calculate keyboard height differently
    // const height = Dimensions.get('screen').height;
    // setPageHeight(height - event?.endCoordinates?.screenY - Platform.select({ ios: UI_SIZES.screen.bottomInset, default: 0 }));
    // setEmojiVisible(false);
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

  useEffect(() => {
    props.navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => <NavBarAction icon="ui-send" onPress={() => console.log(getContent())} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderToolbar = () => {
    return (
      <Animated.View style={{ transform: [{ translateY: transformToolbar }], opacity: opacityToolbar }}>
        <RichToolbar editor={richText} style={styles.richBar} />
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
          <TextInput style={styles.inputTitle} placeholder="Titre du billet" autoCorrect={false} spellCheck={false} />
          <RichEditor
            disabled={props.route.params.mode !== RichTextEditorMode.ENABLED}
            enterKeyHint="done"
            editorStyle={styles.content}
            firstFocusEnd={false}
            initialContentHTML=""
            initialFocus={false}
            pasteAsPlainText
            placeholder="Saisissez votre texte"
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
          />
        </ScrollView>
        {renderToolbar()}
      </KeyboardAvoidingView>
    </PageView>
  );
}
