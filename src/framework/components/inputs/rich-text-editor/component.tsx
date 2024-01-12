import { useHeaderHeight } from '@react-navigation/elements';
import * as React from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { RichEditor, RichToolbar } from '~/framework/components/inputs/rich-text-editor';
import { PageView } from '~/framework/components/page';

import styles from './styles';
import { RichEditorFormProps } from './types';

const RichEditorForm = (props: RichEditorFormProps) => {
  const [contentHtml, setContentHtml] = React.useState(props.initialContentHtml ?? '');
  const contentRef = React.useRef('');
  const headerHeight = useHeaderHeight();
  const richText = React.useRef<RichEditor>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const opacityToolbar = React.useRef(new Animated.Value(0)).current;
  const transformToolbar = React.useRef(new Animated.Value(90)).current;

  const getContent = () => contentRef.current;

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

  const handleChange = React.useCallback((html: string) => {
    contentRef.current = html;
    setContentHtml(html);
  }, []);

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

  const renderToolbar = () => {
    return (
      <Animated.View style={{ transform: [{ translateY: transformToolbar }], opacity: opacityToolbar }}>
        <RichToolbar editor={richText} style={styles.richBar} />
      </Animated.View>
    );
  };

  const renderPostInfos = () => {
    return (
      <PageView>
        <KeyboardAvoidingView
          keyboardVerticalOffset={headerHeight}
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardDismissMode="none" nestedScrollEnabled ref={scrollRef} scrollEventThrottle={20} style={styles.scroll}>
            {props.elements}
            <RichEditor
              disabled={false}
              enterKeyHint="done"
              editorStyle={styles.content}
              firstFocusEnd={false}
              initialContentHTML={props.initialContentHtml ?? ''}
              initialFocus={false}
              pasteAsPlainText
              placeholder="Saisissez votre texte"
              ref={richText}
              style={styles.rich}
              useContainer
              onBlur={handleBlur}
              onChange={handleChange}
              onCursorPosition={handleCursorPosition}
              onFocus={handleFocus}
            />
          </ScrollView>
          {renderToolbar()}
        </KeyboardAvoidingView>
      </PageView>
    );
  };

  return <>{renderPostInfos()}</>;
};

export default RichEditorForm;
