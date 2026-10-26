import * as React from 'react';
import { ListRenderItemInfo, Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { KeyboardStickyView, KeyboardStickyViewProps, useKeyboardState } from 'react-native-keyboard-controller';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { SingleAvatar } from '~/framework/components/avatar';
import { PrimaryButton, TerciaryButton } from '~/framework/components/button';
import { UI_STYLES } from '~/framework/components/constants';
import { ChatTextArea, ChatTextAreaProps } from '~/framework/components/inputs/text2';
import { chat as chatInputStyles } from '~/framework/components/inputs/text2/style';
import { SmallItalicText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { config } from '~/framework/modules/comments';

import { CommentsThreadContext } from './context';
import styles from './styles';
import { CommentsThreadInternalProps, CommentsThreadInternals } from './types';

const FAKE_INPUT_STYLE = [UI_STYLES.flex1, chatInputStyles.wrapper, styles.fakeInput];

export const CommentsThreadAddForm = ({
  onAddRichMessage,
  onBlur,
  onFocus,
  onSubmit,
  placeholder = I18n.get('comment-add-comment'),
  ref,
  stickyOffset = {},
  style,
}: {
  style?: AnimatedStyle<ViewStyle>;
  onFocus?: ChatTextAreaProps['onFocus'];
  onBlur?: ChatTextAreaProps['onBlur'];
  onAddRichMessage?: CommentsThreadInternalProps['onAddRichMessage'];
  onSubmit?: CommentsThreadInternalProps['onSubmit'];
  placeholder?: string;
  ref?: ChatTextAreaProps['ref'];
  stickyOffset?: KeyboardStickyViewProps['offset'];
}) => {
  const [{ newCommentValue }, dispatch] = React.useContext(CommentsThreadContext);
  const [isSending, setIsSending] = React.useState(false);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const onPress = React.useCallback(async () => {
    if (!onSubmit) return;
    try {
      setIsSending(true);
      await onSubmit({ content: newCommentValue, isRichContent: false });
      dispatch({ newCommentValue: '' });
    } catch {
      toast.showError();
    } finally {
      setIsSending(false);
    }
  }, [dispatch, newCommentValue, onSubmit]);
  const session = useSelector(selectors.session);
  const onChangeText = React.useCallback<NonNullable<ChatTextAreaProps['onChangeText']>>(
    text => {
      dispatch({ newCommentValue: text });
    },
    [dispatch],
  );

  const overscrollSize = useKeyboardState(s => s.height) + bottomInset;
  const stickyOverscrollStyle = React.useMemo(
    () => [styles.stickyOverscroll, { marginBottom: -overscrollSize, paddingBottom: overscrollSize }],
    [overscrollSize],
  );

  return (
    <Animated.View pointerEvents="box-none" style={style}>
      <KeyboardStickyView offset={stickyOffset} style={stickyOverscrollStyle}>
        <View
          style={styles.stickyCommentWrapper}
          onLayout={React.useCallback(
            ({ nativeEvent: { layout } }) => {
              dispatch({ newCommentHeight: layout.height });
            },
            [dispatch],
          )}>
          <SingleAvatar size="md" userId={session?.user.id} />
          {onAddRichMessage ? (
            <Pressable style={FAKE_INPUT_STYLE} onPress={onAddRichMessage} testID="open-editor-modal">
              <SmallItalicText style={styles.fakeInputPlaceholder} numberOfLines={1}>
                {placeholder}
              </SmallItalicText>
            </Pressable>
          ) : (
            <>
              <ChatTextArea
                ref={ref}
                maxLength={config.maxLength}
                wrapperStyle={[UI_STYLES.flex1]}
                value={newCommentValue}
                onChangeText={onChangeText}
                editable={!isSending}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
              />
              <PrimaryButton
                onPress={onPress}
                testID="comment-add"
                disabled={!newCommentValue.length}
                icon="ui-send"
                loading={isSending}
              />
            </>
          )}
        </View>
      </KeyboardStickyView>
    </Animated.View>
  );
};

// ToDo : refacto these components

export const CommentsThreadEditForm = ({
  listRef,
  onBlur,
  onFocus,
  onSubmit,
  ref,
  style: _style,
  ...info
}: {
  style?: StyleProp<ViewStyle>;
  onFocus?: ChatTextAreaProps['onFocus'];
  onBlur?: ChatTextAreaProps['onBlur'];
  onSubmit?: CommentsThreadInternalProps['onEdit'];
  ref?: ChatTextAreaProps['ref'];
} & ListRenderItemInfo<CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem> &
  Pick<CommentsThreadInternals.ItemProps, 'listRef'>) => {
  const scrollToAllowed = React.useRef(true);
  const [{ editId, editValue }, dispatch] = React.useContext(CommentsThreadContext);
  const [isSending, setIsSending] = React.useState(false);
  const onPress = React.useCallback(async () => {
    if (!onSubmit || editValue === undefined || editId === undefined) return;
    try {
      setIsSending(true);
      await onSubmit({ content: editValue, isRichContent: false }, editId);
      dispatch({ editHasChanges: undefined, editId: undefined, editValue: undefined });
    } catch {
      toast.showError();
    } finally {
      setIsSending(false);
    }
  }, [dispatch, editId, editValue, onSubmit]);

  const onCancel = React.useCallback(async () => {
    dispatch({ editHasChanges: undefined, editId: undefined, editValue: undefined });
  }, [dispatch]);

  const style = React.useMemo(() => [styles.nonStickyEditWrapper, _style], [_style]);
  const buttonsStyle = React.useMemo(() => [styles.itemContentButtons, styles.itemContentButtonsEdit], []);

  // Note: FlashList and FlatList have opposite behavior of scroll offset. The first line is for FlashList, the second is for FlatList.
  // const viewOffset = useKeyboardState(state => state.height) - useBottomTabBarHeight();
  const viewOffset = -useKeyboardState(state => state.height) + useBottomTabBarHeight();

  const onChangeText = React.useCallback<NonNullable<ChatTextAreaProps['onChangeText']>>(
    text => {
      if (editValue === undefined || editId === undefined) return;
      dispatch({ editHasChanges: text !== info.item.content, editId, editValue: text });
      if (scrollToAllowed.current === true) {
        listRef?.current?.scrollToIndex({ animated: true, index: info.index, viewOffset, viewPosition: 1 });
        scrollToAllowed.current = false;
        setTimeout(() => {
          scrollToAllowed.current = true;
        }, 500);
      }
    },
    [dispatch, editId, editValue, info.index, info.item.content, listRef, viewOffset],
  );

  return (
    editId !== undefined &&
    editValue !== undefined && (
      <View style={style}>
        <ChatTextArea
          ref={ref}
          maxLength={config.maxLength}
          wrapperStyle={UI_STYLES.flex1}
          value={editValue}
          onChangeText={onChangeText}
          editable={!isSending}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={I18n.get('comment-add-response')}
        />
        <View style={buttonsStyle}>
          <TerciaryButton
            // Note : very ugly workaround because of this one-time specific gray terciary button that is a single one of all its brood
            // @ts-ignore
            contentColor={theme.palette.grey.black}
            contentColorActive={theme.palette.grey.darkness}
            text={I18n.get('comment-cancel')}
            testID="comment-cancel"
            onPress={onCancel}
            disabled={isSending}
          />
          <TerciaryButton
            text={I18n.get('comment-save')}
            testID="comment-save"
            onPress={onPress}
            loading={isSending}
            disabled={editValue.length === 0}
          />
        </View>
      </View>
    )
  );
};
