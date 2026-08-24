import * as React from 'react';
import { Platform, View, ViewStyle } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list';
import { KeyboardChatScrollView, KeyboardStickyView, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { AnimatedStyle, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { useConfirmRemove } from '~/app/navigation/use-confirm-remove';
import { SingleAvatar } from '~/framework/components/avatar';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { ChatTextArea, ChatTextAreaProps } from '~/framework/components/inputs/text2';
import { FlatListProps } from '~/framework/components/list/flat-list';
import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { selectors } from '~/framework/modules/auth/redux/reducer';

import { useSocialCommentsData } from './hooks';
import { SocialResourceViewerItem } from './item';
import styles, { COMMENT_FORM_OVERSCROLL_SIZE } from './styles';
import { type SocialResourceViewer, SocialResourceViewerInternals } from './types';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<SocialResourceViewerInternals.Item>);

export const NewCommentInputContext = React.createContext<{ height: number; value: string }>({ height: 0, value: '' });
export const NewCommentInputDispatchContext = React.createContext<
  React.Dispatch<React.SetStateAction<{ height: number; value: string }>>
>(_ => _);

export function SocialResourceViewer({
  alwaysShowCommentField = false,
  canAddComment: _canAddComment,
  children,
  data,
}: SocialResourceViewer.Props) {
  // User data
  const session = useSelector(selectors.session);
  const canAddComment = session && _canAddComment;

  const { flatData, showResponses } = useSocialCommentsData(data);

  // Screen layout
  const navBarHeight = useHeaderHeight();
  const { bottom: bottomInset } = useSafeAreaInsets();

  // Component layout
  const listRef = React.useRef<FlashListRef<SocialResourceViewerInternals.Item>>(null);
  const [measuredResourceHeight, setMeasuredResourceHeight] = React.useState(0);
  const [measuredListHeight, setMeasuredListHeight] = React.useState(0);

  // Input state
  const [newCommentFormState, newCommentFormDispatch] = React.useState({ height: 0, value: '' });
  const [isNewCommentFocused, setNewCommentIsFocused] = React.useState(false);
  const alwaysShowNewCommentForm = alwaysShowCommentField || isNewCommentFocused || newCommentFormState.value.length > 0;

  // Scroll animation values
  const { height: animatedKeyboardHeight } = useReanimatedKeyboardAnimation();
  const animatedScrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    animatedScrollOffset.value = event.contentOffset.y;
  });

  const inputStyle = useAnimatedStyle(() => {
    const translateValue =
      -animatedScrollOffset.value -
      measuredListHeight +
      measuredResourceHeight +
      newCommentFormState.height +
      Math.max(-animatedKeyboardHeight.value, bottomInset + UI_SIZES.elements.tabbarHeight) -
      bottomInset -
      UI_SIZES.elements.tabbarHeight;
    return {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      transform: [
        {
          translateY: alwaysShowNewCommentForm ? 0 : Math.max(0, translateValue),
        },
      ],
    };
  }, [measuredListHeight, measuredResourceHeight, newCommentFormState.height, alwaysShowNewCommentForm, bottomInset]);

  const renderScrollComponent = React.useCallback<
    NonNullable<FlatListProps<SocialResourceViewerInternals.Item>['renderScrollComponent']>
  >(
    props => (
      <KeyboardChatScrollView
        {...props}
        offset={
          navBarHeight -
          styles.stickyCommentWrapper.paddingBottom +
          COMMENT_FORM_OVERSCROLL_SIZE -
          (Platform.OS === 'android' ? bottomInset : 0)
        }
      />
    ),
    [bottomInset, navBarHeight],
  );

  const renderResource = React.useCallback(() => {
    return (
      <View
        onLayout={({
          nativeEvent: {
            layout: { height },
          },
        }) => {
          setMeasuredResourceHeight(height);
        }}>
        {children}
      </View>
    );
  }, [children]);

  const onFocus = React.useCallback(() => {
    setNewCommentIsFocused(true);
  }, []);
  const onBlur = React.useCallback(() => {
    setNewCommentIsFocused(false);
  }, []);
  const onLayout = React.useCallback(({ nativeEvent: { layout } }) => {
    setMeasuredListHeight(layout.height);
  }, []);
  const scrollIndicatorInsets = React.useMemo(
    () => ({
      bottom: newCommentFormState.height,
    }),
    [newCommentFormState.height],
  );

  useConfirmRemove(newCommentFormState.value.length > 0, {
    text: I18n.get('comment-preventback-alert-text'),
    title: I18n.get('comment-preventback-alert-title'),
  });

  const listFooterStyle = React.useMemo(
    () => ({
      height: newCommentFormState.height,
    }),
    [newCommentFormState.height],
  );

  const renderItem = React.useCallback<NonNullable<FlashListProps<SocialResourceViewerInternals.Item>['renderItem']>>(
    info => <SocialResourceViewerItem {...info} onShowResponses={showResponses} />,
    [showResponses],
  );

  const keyExtractor = React.useCallback<NonNullable<FlashListProps<SocialResourceViewerInternals.Item>['keyExtractor']>>(item => {
    switch (item.type) {
      case SocialResourceViewerInternals.ITEM_COMMENT:
      case SocialResourceViewerInternals.ITEM_COMMENT_DELETED:
      case SocialResourceViewerInternals.ITEM_RESPONSE:
      case SocialResourceViewerInternals.ITEM_RESPONSE_DELETED:
        return item.id;
      case SocialResourceViewerInternals.ITEM_RESPONSE_ELLIPSIS:
        return `${SocialResourceViewerInternals.ITEM_RESPONSE_ELLIPSIS.toString()}|${item.inReplyTo}|${item.start}|${item.count}`;
      case SocialResourceViewerInternals.ITEM_ADD_RESPONSE:
        return `${SocialResourceViewerInternals.ITEM_ADD_RESPONSE.toString()}|${item.inReplyTo}`;
    }
  }, []);

  const getItemType = React.useCallback<NonNullable<FlashListProps<SocialResourceViewerInternals.Item>['getItemType']>>(
    item => item.type.toString(),
    [],
  );

  return (
    <NewCommentInputContext value={newCommentFormState}>
      <NewCommentInputDispatchContext value={newCommentFormDispatch}>
        <AnimatedFlashList
          ref={listRef}
          onLayout={onLayout}
          keyboardDismissMode="interactive"
          onScroll={scrollHandler}
          renderScrollComponent={renderScrollComponent}
          data={flatData}
          renderItem={renderItem}
          getItemType={getItemType}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderResource}
          ListFooterComponent={<View style={listFooterStyle} />}
          scrollIndicatorInsets={scrollIndicatorInsets}
          keyboardShouldPersistTaps="handled"
        />
        {canAddComment && (
          <SocialResourceViewerAddCommentForm session={session} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        )}
      </NewCommentInputDispatchContext>
    </NewCommentInputContext>
  );
}

export const SocialResourceViewerAddCommentForm = ({
  onBlur,
  onFocus,
  session,
  style,
}: {
  style: AnimatedStyle<ViewStyle>;
  onFocus?: ChatTextAreaProps['onFocus'];
  onBlur?: ChatTextAreaProps['onBlur'];
  session: AuthActiveAccount | AuthSavedLoggedInAccount;
}) => {
  const inputState = React.useContext(NewCommentInputContext);
  const inputDispatch = React.useContext(NewCommentInputDispatchContext);
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
  return (
    <Animated.View
      style={style}
      onLayout={React.useCallback(
        ({ nativeEvent: { layout } }) => {
          inputDispatch(state => ({ ...state, height: layout.height }));
        },
        [inputDispatch],
      )}>
      <KeyboardStickyView offset={stickyViewOffset}>
        <View style={styles.stickyCommentWrapper}>
          <SingleAvatar size="md" userId={session.user.id} />
          <ChatTextArea
            maxLength={80}
            wrapperStyle={[UI_STYLES.flex1]}
            value={inputState.value}
            onChangeText={React.useCallback<NonNullable<ChatTextAreaProps['onChangeText']>>(
              text => {
                inputDispatch(state => ({ ...state, value: text }));
              },
              [inputDispatch],
            )}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={I18n.get('comment-add-comment')}
          />
          <PrimaryButton disabled={!inputState.value.length} iconLeft="ui-send" round />
        </View>
      </KeyboardStickyView>
    </Animated.View>
  );
};

export const SocialResourceViewerError = () => <EmptyContentScreen />;
