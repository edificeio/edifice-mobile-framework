import { useHeaderHeight } from '@react-navigation/elements';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Keyboard, ScrollView, View } from 'react-native';

import { RichEditor, RichToolbar, actions } from '~/framework/components/inputs/rich-text-editor';

import styles from './styles';
import { RichTextEditorMode, RichTextEditorProps } from './types';

export default function RichTextEditor(props: RichTextEditorProps) {
  const contentRef = useRef('');
  const headerHeight = useHeaderHeight();
  const richText = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);

  const translateAnim = useRef(new Animated.Value(200)).current;
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
        toValue: 200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToolbarPage]);

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

  const handleFocus = useCallback(() => {
    console.log('editor focus');
    setShowToolbarPage(false);
  }, []);

  const handleHeightChange = useCallback((height: number) => {
    console.log('editor height change:', height);
  }, []);

  const handleInput = useCallback(() => {
    // console.log(inputType, data)
  }, []);

  const handlePaste = useCallback((text: any) => {
    console.debug(`Paste: ${text}`);
  }, []);

  const onInsertLink = useCallback(() => {
    console.debug('Not implemented yet, but possible...');
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
    // As event?.endCoordinates?.height returns a wrong value on Android,
    // We must calculate keyboard height differently
    const height = Dimensions.get('screen').height;
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
  // Display rich rext editor screen
  //

  const renderToolbar = () => {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          borderColor: 'blue',
          borderWidth: 1,
          bottom: 0,
          transform: [{ translateY: translateAnim }],
        }}>
        <RichToolbar
          actions={[
            actions.undo,
            actions.redo,
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.alignLeft,
            actions.alignCenter,
            actions.alignRight,
            actions.removeFormat,
            actions.insertBulletsList,
            actions.indent,
            actions.outdent,
            actions.insertLink,
            actions.line,
            actions.setStrikethrough,
          ]}
          disabledIconTint="#bfbfbf"
          editor={richText}
          flatContainerStyle={styles.flatStyle}
          selectedIconTint="#2095F2"
          style={styles.richBar}
          onInsertLink={onInsertLink}
          disabled={props.mode !== RichTextEditorMode.ENABLED}
          onSelectItem={onSelectItemToolbar}
        />
      </Animated.View>
    );
  };

  return (
    <View
      //keyboardVerticalOffset={headerHeight}
      style={[styles.container, { backgroundColor: '#bfbfbf' }]}
      //behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardDismissMode="none" nestedScrollEnabled ref={scrollRef} scrollEventThrottle={20} style={styles.scroll}>
        <RichEditor
          disabled={props.mode !== RichTextEditorMode.ENABLED}
          enterKeyHint="done"
          editorStyle={styles.content}
          firstFocusEnd={false}
          initialContentHTML={props.content ?? ''}
          initialFocus={false}
          pasteAsPlainText
          placeholder="Écrivez votre texte ici"
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
          onPaste={handlePaste}
        />
      </ScrollView>
      {props.mode !== RichTextEditorMode.PREVIEW ? renderToolbar() : null}
    </View>
  );
}
