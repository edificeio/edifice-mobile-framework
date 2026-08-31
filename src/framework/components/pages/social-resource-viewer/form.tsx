import * as React from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import { PrimaryButton } from '~/framework/components/button';
import { UI_STYLES } from '~/framework/components/constants';
import { ChatTextArea, ChatTextAreaProps } from '~/framework/components/inputs/text2';
import toast from '~/framework/components/toast';
import { AuthActiveAccount } from '~/framework/modules/auth/model';

import { SocialResourceViewerContext } from './context';
import styles, { COMMENT_FORM_OVERSCROLL_SIZE } from './styles';
import { type SocialResourceViewer } from './types';

export const SocialResourceViewerAddCommentForm = ({
  onBlur,
  onFocus,
  onSubmit,
  ref,
  session,
  style,
}: {
  style?: AnimatedStyle<ViewStyle>;
  onFocus?: ChatTextAreaProps['onFocus'];
  onBlur?: ChatTextAreaProps['onBlur'];
  session: AuthActiveAccount;
  onSubmit?: SocialResourceViewer.Props['onSubmit'];
  ref?: ChatTextAreaProps['ref'];
}) => {
  const [{ newCommentValue }, dispatch] = React.useContext(SocialResourceViewerContext);
  const [isSending, setIsSending] = React.useState(false);
  const navBarHeight = useHeaderHeight();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const stickyViewOffset = React.useMemo(
    () => ({
      closed: 0,
      opened:
        navBarHeight -
        styles.stickyCommentWrapper.paddingBottom +
        COMMENT_FORM_OVERSCROLL_SIZE -
        (Platform.OS === 'android' ? bottomInset : 0),
    }),
    [bottomInset, navBarHeight],
  );
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
  return (
    <Animated.View
      style={style}
      onLayout={React.useCallback(
        ({ nativeEvent: { layout } }) => {
          dispatch({ newCommentHeight: layout.height });
        },
        [dispatch],
      )}>
      <KeyboardStickyView offset={stickyViewOffset}>
        <View style={styles.stickyCommentWrapper}>
          <SingleAvatar size="md" userId={session.user.id} />
          <ChatTextArea
            ref={ref}
            maxLength={80}
            wrapperStyle={[UI_STYLES.flex1]}
            value={newCommentValue}
            onChangeText={React.useCallback<NonNullable<ChatTextAreaProps['onChangeText']>>(
              text => {
                dispatch({ newCommentValue: text });
              },
              [dispatch],
            )}
            editable={!isSending}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={I18n.get('comment-add-comment')}
          />
          <PrimaryButton
            onPress={onPress}
            testID="comment-add"
            disabled={!newCommentValue.length}
            icon="ui-send"
            loading={isSending}
          />
        </View>
      </KeyboardStickyView>
    </Animated.View>
  );
};

export const SocialResourceViewerAddResponseForm = ({
  onBlur,
  onFocus,
  onSubmit,
  // listRef,
  ref,
  replyTo,
  session,
  style: _style,
}: {
  style?: StyleProp<ViewStyle>;
  onFocus?: ChatTextAreaProps['onFocus'];
  onBlur?: ChatTextAreaProps['onBlur'];
  session: AuthActiveAccount;
  onSubmit?: SocialResourceViewer.Props['onSubmit'];
  replyTo: SocialResourceViewer.CommentItem['id'];
  ref?: ChatTextAreaProps['ref'];
  // listRef: React.RefObject<FlashListRef<SocialResourceViewerInternals.Item> | null>;
}) => {
  const [{ newResponseValue }, dispatch] = React.useContext(SocialResourceViewerContext);
  const [isSending, setIsSending] = React.useState(false);
  const onPress = React.useCallback(async () => {
    if (!onSubmit) return;
    try {
      setIsSending(true);
      await onSubmit({ content: newResponseValue, isRichContent: false }, replyTo);
      dispatch({ newResponseId: undefined, newResponseValue: '' });
    } catch {
      toast.showError();
    } finally {
      setIsSending(false);
    }
  }, [dispatch, newResponseValue, onSubmit, replyTo]);

  const style = React.useMemo(() => [styles.nonStickyCommentWrapper, _style], [_style]);

  return (
    <View style={style}>
      <SingleAvatar size="md" userId={session.user.id} />
      <ChatTextArea
        ref={ref}
        maxLength={80}
        wrapperStyle={[UI_STYLES.flex1]}
        value={newResponseValue}
        onChangeText={React.useCallback<NonNullable<ChatTextAreaProps['onChangeText']>>(
          text => {
            dispatch({ newResponseValue: text });
          },
          [dispatch],
        )}
        editable={!isSending}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={I18n.get('comment-add-response')}
      />
      <PrimaryButton
        onPress={onPress}
        testID="comment-add"
        disabled={!newResponseValue.length}
        icon="ui-send"
        loading={isSending}
      />
    </View>
  );
};
