import * as React from 'react';
import { Alert, TextInput, View } from 'react-native';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { KeyboardChatScrollView } from 'react-native-keyboard-controller';
import Animated, {
  FlatListPropsWithLayout,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useComposedEventHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { useConfirmRemove } from '~/app/navigation/use-confirm-remove';
import theme from '~/app/theme';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { FlatListProps } from '~/framework/components/list/flat-list';
import { Svg } from '~/framework/components/picture';
import { CaptionText, SmallBoldText } from '~/framework/components/text';
import { usePrevious } from '~/framework/hooks/previous';
import { useSyncRef } from '~/framework/hooks/ref';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { isModalModeOnThisRoute } from '~/framework/navigation/hideTabBarAndroid';
import { unwrapAnimatedProp } from '~/framework/util/reanimated';

import { CommentsThreadContext, commentsThreadContextInitialData, commentsThreadContextReducer } from './context';
import { CommentsThreadAddForm } from './form';
import { DEFAULT_CONFIG, useCommentsThreadData } from './hooks';
import { CommentsThread as CommentsThreadComponents } from './item';
import styles from './styles';
import { CommentsThreadInternals, CommentsThreadProps } from './types';

export function CommentsThread({
  allowReplies = DEFAULT_CONFIG.allowReplies,
  alwaysShowCommentField = false,
  canAddComment: _canAddComment,
  data,
  focusItem,
  ListHeaderComponent: _ListHeaderComponent,
  navigation,
  onDelete,
  onEdit,
  onScroll: _onScroll,
  onSubmit,
  ref,
  refreshControl,
  repliesPageSize,
  repliesStartSize,
  route,
  ...props
}: Readonly<CommentsThreadProps>) {
  const session = useSelector(selectors.session);
  const canAddComment = session && _canAddComment;

  const context = React.useReducer(commentsThreadContextReducer, commentsThreadContextInitialData);

  const { flatData, unfoldReplies } = useCommentsThreadData(data, {
    allowReplies,
    repliesPageSize,
    repliesStartSize,
  });

  // Screen layout
  const tabBarHeight = useBottomTabBarHeight() * (isModalModeOnThisRoute(route.name) ? 0 : 1);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const formBottomInset = Math.max(bottomInset - tabBarHeight, 0);
  const [measuredResourceHeight, setMeasuredResourceHeight] = React.useState(0);
  const [measuredListHeight, setMeasuredListHeight] = React.useState(0);

  // Refs
  const listRef = useAnimatedRef<Animated.FlatList<CommentsThreadInternals.Item>>();
  const inlineEditRef = React.useRef<TextInput>(null);

  // Add comment Input state
  const { newCommentHeight, newCommentValue } = context[0];
  const [isNewCommentFocused, setNewCommentIsFocused] = React.useState(false);
  const alwaysShowNewCommentForm = alwaysShowCommentField || isNewCommentFocused || newCommentValue.length > 0;

  // Scroll animation
  const animatedScrollOffset = useSharedValue(0);
  const onScrollInternal = useAnimatedScrollHandler(event => {
    animatedScrollOffset.value = event.contentOffset.y;
  });
  const onScroll = useComposedEventHandler([onScrollInternal, unwrapAnimatedProp(_onScroll) ?? null]);
  const inputStyle = useAnimatedStyle(() => {
    const translateValue = -animatedScrollOffset.value - measuredListHeight + measuredResourceHeight + newCommentHeight;
    return {
      /**
       * @see https://github.com/facebook/react-native/issues/54659
       * `top: 0` (instead of an intrinsic height) makes this absolutely-positioned wrapper span the
       * whole available height, so its native layout bounds always cover the range the sticky form
       * can be translated across (safe-area/keyboard offsets). Without this, Android rejects touches
       * on the sticky form whenever it is translated outside this wrapper's own (untransformed) frame.
       * This seems to be caused by the behaviour of new architecture on Android.
       * @see https://github.com/facebook/react-native/issues/44768
       * This fix also doesn't cause regression on iOS so there no need to separate logic form different platforms.
       * `justifyContent: 'flex-end'` allow to maintain the view at the bottom despite the presence of `top: 0` & `bottom: 0`.
       */
      bottom: 0,
      justifyContent: 'flex-end',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      transform: [
        {
          translateY: alwaysShowNewCommentForm ? 0 : Math.max(0, translateValue),
        },
      ],
    };
  }, [measuredListHeight, measuredResourceHeight, newCommentHeight, alwaysShowNewCommentForm]);

  const stickyViewOffset = React.useMemo(
    () => ({
      closed: -formBottomInset,
      opened: tabBarHeight,
    }),
    [tabBarHeight, formBottomInset],
  );

  const extraContentPadding = useSharedValue(0);
  React.useLayoutEffect(() => {
    extraContentPadding.value = newCommentHeight + formBottomInset;
  }, [extraContentPadding, formBottomInset, newCommentHeight]);

  const renderScrollComponent = React.useCallback<
    NonNullable<FlatListProps<CommentsThreadInternals.Item>['renderScrollComponent']>
  >(
    scrollProps => (
      <KeyboardChatScrollView
        {...scrollProps}
        keyboardLiftBehavior="whenAtEnd"
        offset={tabBarHeight + formBottomInset}
        extraContentPadding={extraContentPadding}
      />
    ),
    [tabBarHeight, formBottomInset, extraContentPadding],
  );

  const UnwrappedListHeaderComponent = unwrapAnimatedProp(_ListHeaderComponent);

  const ListHeaderComponent = (
    <CommentsThreadHeaderComponent
      onMeasure={React.useCallback(rect => {
        setMeasuredResourceHeight(rect.height);
      }, [])}>
      {!UnwrappedListHeaderComponent || React.isValidElement(UnwrappedListHeaderComponent) ? (
        UnwrappedListHeaderComponent
      ) : (
        <UnwrappedListHeaderComponent />
      )}
    </CommentsThreadHeaderComponent>
  );

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
      bottom: -formBottomInset,
    }),
    [formBottomInset],
  );

  const hasChangesInInlineEditingFrom = React.useCallback(
    (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem) =>
      context[0].editId !== undefined && context[0].editId !== item.id && context[0].editHasChanges,
    [context],
  );

  const hasChangesInInlineEditing = React.useMemo(() => context[0].editId !== undefined && !!context[0].editHasChanges, [context]);

  const isInlineEditing = context[0].editId !== undefined;

  useConfirmRemove(newCommentValue.length > 0 || hasChangesInInlineEditing, {
    text: I18n.get('comment-preventback-alert-text'),
    title: I18n.get('comment-preventback-alert-title'),
  });

  const confirmQuitEdit = React.useCallback((callback: () => void) => {
    Alert.alert(I18n.get('comment-canceledit-alert-title'), I18n.get('comment-canceledit-alert-text'), [
      {
        onPress: () => {},
        style: 'default',
        text: I18n.get('common-cancel'),
      },
      {
        onPress: callback,
        style: 'destructive',
        text: I18n.get('common-delete'),
      },
    ]);
  }, []);

  const onPressReply = React.useCallback<NonNullable<CommentsThreadInternals.ItemProps['onPressReply']>>(
    item => {
      const beginReply = () => {
        navigation.navigate('comments/reply', { commentId: item.id });
      };

      if (hasChangesInInlineEditingFrom(item)) confirmQuitEdit(beginReply);
      else beginReply();
    },
    [confirmQuitEdit, hasChangesInInlineEditingFrom, navigation],
  );

  const onPressEdit = React.useCallback<NonNullable<CommentsThreadInternals.ItemProps['onPressEdit']>>(
    item => {
      const beginEdit = () => {
        context[1]({ editHasChanges: false, editId: item.id, editValue: item.content });
        requestAnimationFrame(() => {
          inlineEditRef?.current?.focus();
        });
      };
      if (hasChangesInInlineEditingFrom(item)) confirmQuitEdit(beginEdit);
      else beginEdit();
    },
    [confirmQuitEdit, context, hasChangesInInlineEditingFrom],
  );

  const onPressDelete = React.useCallback<NonNullable<CommentsThreadInternals.ItemProps['onPressDelete']>>(
    item => {
      Alert.alert(I18n.get('comment-delete-alert-title'), I18n.get('comment-delete-alert-text'), [
        {
          onPress: () => {},
          style: 'default',
          text: I18n.get('common-cancel'),
        },
        {
          onPress: () => {
            onDelete?.(item.id);
          },
          style: 'destructive',
          text: I18n.get('common-delete'),
        },
      ]);
    },
    [onDelete],
  );

  const renderItem = React.useCallback<NonNullable<FlatListProps<CommentsThreadInternals.Item>['renderItem']>>(
    info => (
      <CommentsThreadComponents.Item
        {...info}
        allowReplies={allowReplies}
        onUnfoldReplies={unfoldReplies}
        canAddComment={canAddComment}
        onPressReply={onPressReply}
        onPressEdit={onPressEdit}
        onSendEdit={onEdit}
        onPressDelete={onPressDelete}
        inputRef={inlineEditRef}
        listRef={listRef}
      />
    ),
    [allowReplies, canAddComment, listRef, onEdit, onPressDelete, onPressEdit, onPressReply, unfoldReplies],
  );

  const keyExtractor = React.useCallback<NonNullable<FlatListProps<CommentsThreadInternals.Item>['keyExtractor']>>(item => {
    switch (item.type) {
      case CommentsThreadInternals.ITEM_COMMENT:
      case CommentsThreadInternals.ITEM_COMMENT_DELETED:
      case CommentsThreadInternals.ITEM_REPLY:
      case CommentsThreadInternals.ITEM_REPLY_DELETED:
        return item.id;
      case CommentsThreadInternals.ITEM_REPLY_ELLIPSIS:
        return `${CommentsThreadInternals.ITEM_REPLY_ELLIPSIS.toString()}|${item.inReplyTo}|${item.start}|${item.count}`;
    }
  }, []);

  // auto-scroll
  const previousFocusItem = usePrevious(focusItem);
  if (focusItem && previousFocusItem !== focusItem) {
    const scrollToIndex = flatData.findIndex(e => 'id' in e && e.id === focusItem);
    scrollToIndex !== -1 &&
      listRef.current?.scrollToIndex({
        animated: true,
        index: scrollToIndex,
        viewPosition: 0,
      });
  }

  // Note: FlatList is used instead of FlashList because it doesn't unmount clipped input elements, allowing scrolling to current editing item from everwhere.

  return (
    <CommentsThreadContext value={context}>
      <Animated.FlatList
        {...(props as FlatListPropsWithLayout<CommentsThreadInternals.Item>)}
        ref={useSyncRef(listRef, ref)}
        onLayout={onLayout}
        keyboardDismissMode="interactive"
        onScroll={onScroll}
        renderScrollComponent={renderScrollComponent}
        data={flatData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        scrollIndicatorInsets={scrollIndicatorInsets}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        ListEmptyComponent={<CommentsThreadEmpty canAddComment={canAddComment ?? false} />}
      />
      {canAddComment && !isInlineEditing && (
        <CommentsThreadAddForm
          onSubmit={onSubmit}
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
          stickyOffset={stickyViewOffset}
        />
      )}
    </CommentsThreadContext>
  );
}

export const CommentsThreadError = () => <EmptyContentScreen />;

export const CommentsThreadEmpty = ({ canAddComment }: Pick<CommentsThreadProps, 'canAddComment'>) =>
  canAddComment && (
    <View style={styles.emptyWrapper}>
      <Svg
        name="ui-edifice-shape-half-circle"
        style={styles.emptyDecoBackground}
        fill={theme.palette.primary.light}
        preserveAspectRatio="meet"
        width={styles.emptyDecoBackground.width}
        height={styles.emptyDecoBackground.height}
      />
      <Svg
        name="ui-edifice-comments-color"
        style={styles.emptyDeco}
        preserveAspectRatio="meet"
        width={styles.emptyDeco.width}
        height={styles.emptyDeco.height}
      />
      <View style={styles.emptyBorderTop} />
      <View style={styles.emptyBorderBottom} />
      <View style={styles.emptyTexts}>
        <SmallBoldText style={styles.emptyTitle}>{I18n.get('comments-empty-title')}</SmallBoldText>
        <CaptionText style={styles.emptyDescription}>{I18n.get('comments-empty-description')}</CaptionText>
      </View>
    </View>
  );

const CommentsThreadHeaderComponent = ({
  children,
  onMeasure,
}: React.PropsWithChildren<{ onMeasure?: (rect: DOMRect) => void }>) => {
  const ref = React.useRef<View>(null);
  React.useLayoutEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    rect && onMeasure?.(rect);
  }, [onMeasure]);

  return <View ref={ref}>{children}</View>;
};
