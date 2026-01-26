import React from 'react';
import { PixelRatio, Platform, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

import styles from './styles';
import { SingleAvatar } from '../avatar';
import { UI_SIZES, UI_STYLES } from '../constants';
import { CaptionItalicText, TextSizeStyle } from '../text';

import { AuthActiveAccount } from '~/framework/modules/auth/model';

export interface CommentFormProps {
  initialData?: string;
  onSubmit?: (data: string) => void;
  style?: ViewProps['style'];
  userId: AuthActiveAccount['user']['id'];
}

export const CommentForm = ({ initialData = '', style, userId }: CommentFormProps) => {
  const [data, setData] = React.useState(initialData);
  return (
    <View style={React.useMemo(() => [styles.commentForm, style], [style])}>
      <SingleAvatar userId={userId} size="md" border={false} />
      <CommentTextInput
        value={data}
        onChange={React.useCallback<NonNullable<CommentTextInputProps['onChange']>>(({ nativeEvent: { text } }) => {
          setData(text);
        }, [])}
        style={UI_STYLES.flex1}
      />

      {/*<PrimaryButton
        action={React.useCallback(() => onSubmit?.(data), [data, onSubmit])}
        disabled={data.length === 0}
        iconLeft="ui-send"
      />*/}
    </View>
  );
};

const IOS_LINE_HEIGHT_RATIO = 1.1475;

const useTextInputContentSize = (lineHeight: number) => {
  const [contentHeight, setContentHeight] = React.useState<number>(0);
  const onContentSizeChange = React.useCallback<NonNullable<TextInputProps['onContentSizeChange']>>(
    ({ nativeEvent: { contentSize } }) => {
      setContentHeight(contentSize.height);
    },
    [],
  );
  const textHeight = React.useMemo(
    () => (Platform.OS === 'android' ? contentHeight - (contentHeight % lineHeight) : contentHeight / IOS_LINE_HEIGHT_RATIO),
    [contentHeight, lineHeight],
  );
  return {
    contentHeight,
    lineHeight: lineHeight,
    nbLines: textHeight / lineHeight,
    onContentSizeChange,
    textHeight,
    totalVerticalPaddingAndroid: contentHeight - textHeight,
  };
};

interface CommentTextInputProps extends Pick<TextInputProps, 'value' | 'onChange'> {
  style: StyleProp<
    { paddingVertical?: number } & Pick<ViewStyle, 'flex' | 'backgroundColor' | 'borderRadius' | 'borderWidth' | 'borderColor'>
  >;
}

export const CommentTextInput = ({ onChange, style: _style, value }: CommentTextInputProps) => {
  const fontScale = PixelRatio.getFontScale();

  const { ...wrapperStyle } = React.useMemo(() => StyleSheet.flatten(_style), [_style]);
  const defaultStyle = styles.commentTextInput as CommentTextInputProps['style'];
  const {
    paddingVertical = (UI_SIZES.elements.avatar.md - 2 * UI_SIZES.border.thin - fontScale * TextSizeStyle.Small.lineHeight) / 2,
    ...style
  } = React.useMemo(() => StyleSheet.flatten([defaultStyle, {}]), [defaultStyle]);

  const MAX_LINES = 5;
  const { lineHeight, nbLines, onContentSizeChange } = useTextInputContentSize(fontScale * styles.commentTextInput.lineHeight);

  const textInputStyle = React.useMemo(
    () =>
      Platform.OS === 'android'
        ? [
            styles.commentTextInput,
            style,
            nbLines <= 1
              ? { height: lineHeight + 2 * paddingVertical }
              : {
                  maxHeight: lineHeight * MAX_LINES + 2 * UI_SIZES.spacing.minor,
                  minHeight: lineHeight + 2 * paddingVertical,
                },
          ]
        : [
            styles.commentTextInput,
            style,
            {
              height: lineHeight * Math.min(MAX_LINES, nbLines) + 2 * paddingVertical,
              lineHeight: styles.commentTextInput.lineHeight * IOS_LINE_HEIGHT_RATIO,
              paddingVertical: (UI_SIZES.elements.avatar.md - 2 * UI_SIZES.border.thin - lineHeight * IOS_LINE_HEIGHT_RATIO) / 2,
            },
          ],
    [style, nbLines, lineHeight, paddingVertical],
  );

  const commentTextInputPlaceholderStyle = React.useMemo(
    () => [
      styles.commentTextInputPlaceholder,
      {
        marginVertical: Math.max(
          (UI_SIZES.elements.avatar.md - 2 * UI_SIZES.border.thin - fontScale * TextSizeStyle.Small.lineHeight) / 2,
          0,
        ),
      },
    ],
    [fontScale],
  );

  const inputRef = React.useRef<TextInput>(null);
  const onKeyPress = () => {
    inputRef.current?.setNativeProps({ text: value });
  };

  return (
    <View style={React.useMemo(() => [styles.commentTextInputWrapper, wrapperStyle], [wrapperStyle])}>
      <TextInput
        ref={inputRef}
        style={textInputStyle}
        value={value}
        onChange={onChange}
        onContentSizeChange={onContentSizeChange}
        multiline
        onKeyPress={onKeyPress}
        aria-label="Ajouter un commentaire..."
        maxLength={800}
      />
      {value === '' && (
        <CaptionItalicText numberOfLines={1} style={commentTextInputPlaceholderStyle}>
          Ajouter un commentaire...
        </CaptionItalicText>
      )}
      <View style={styles.commentTextShadow}></View>
    </View>
  );
};
