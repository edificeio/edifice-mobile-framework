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

/** Bounded so that a target which never gets laid out can't have the auto-scroll spin frame after frame. */
const MAX_FOCUS_SCROLL_ATTEMPTS = 3;

export function CommentsThread({
  allowReplies = DEFAULT_CONFIG.allowReplies,
  alwaysShowCommentField = false,
  canAddComment: _canAddComment,
  data,
  focusItem,
  ListFooterComponent: UserListFooterComponent,
  ListHeaderComponent: UserListHeaderComponent,
  navigation,
  onDelete,
  onEdit,
  onScroll: _onScroll,
  onScrollToIndexFailed: _onScrollToIndexFailed,
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

  const { flatData, unfoldReplies } = useCommentsThreadData(data, context[0], {
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
  }, [measuredListHeight, measuredResourceHeight, newCommentHeight, alwaysShowNewCommentForm]);

  const stickyViewOffset = React.useMemo(
    () => ({
      closed: -formBottomInset,
      opened: tabBarHeight,
    }),
    [tabBarHeight, formBottomInset],
  );

  const renderScrollComponent = React.useCallback<
    NonNullable<FlatListProps<CommentsThreadInternals.Item>['renderScrollComponent']>
  >(
    scrollProps => (
      <KeyboardChatScrollView {...scrollProps} keyboardLiftBehavior="whenAtEnd" offset={tabBarHeight + formBottomInset} />
    ),
    [tabBarHeight, formBottomInset],
  );

  const ListHeaderComponent = React.useCallback<React.ComponentType & NonNullable<CommentsThreadProps['ListHeaderComponent']>>(
    (headerProps: any) => {
      const Resolved = unwrapAnimatedProp(UserListHeaderComponent);
      return (
        <View
          onLayout={({
            nativeEvent: {
              layout: { height },
            },
          }) => {
            setMeasuredResourceHeight(height);
          }}>
          {!!Resolved && (React.isValidElement(Resolved) ? Resolved : <Resolved {...headerProps} />)}
        </View>
      );
    },
    [UserListHeaderComponent],
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
      bottom: newCommentHeight,
    }),
    [newCommentHeight],
  );

  const listFooterStyle = React.useMemo(
    () => ({
      height: newCommentHeight + formBottomInset,
    }),
    [formBottomInset, newCommentHeight],
  );

  const ListFooterComponent = React.useCallback<React.ComponentType & NonNullable<CommentsThreadProps['ListFooterComponent']>>(
    (headerProps: any) => {
      const Resolved = unwrapAnimatedProp(UserListFooterComponent);
      return (
        <>
          {!!Resolved && (React.isValidElement(Resolved) ? Resolved : <Resolved {...headerProps} />)}
          <View style={listFooterStyle} />
        </>
      );
    },
    [UserListFooterComponent, listFooterStyle],
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
  const scrolledFocusItemRef = React.useRef<CommentsThreadProps['focusItem']>(undefined);
  const scrollToIndexFailedRef = React.useRef(false);

  /**
   * `scrollToIndex` calls it synchronously when the target cell isn't laid out yet : it doubles as the "did the
   * scroll actually happen ?" signal, and its mere presence keeps `VirtualizedList` from throwing.
   */
  const onScrollToIndexFailed = React.useCallback<
    NonNullable<FlatListProps<CommentsThreadInternals.Item>['onScrollToIndexFailed']>
  >(
    info => {
      scrollToIndexFailedRef.current = true;
      unwrapAnimatedProp(_onScrollToIndexFailed)?.(info);
    },
    [_onScrollToIndexFailed],
  );

  React.useEffect(() => {
    if (!focusItem || scrolledFocusItemRef.current === focusItem) return;
    const index = flatData.findIndex(e => 'id' in e && e.id === focusItem);
    if (index === -1) return; // Not in the list (yet) : a further render will retry.

    // Scrolling from a frame callback rather than from the render phase lets the list commit the item first,
    // otherwise its index is out of the range the list knows about, and lay it out, otherwise it can't be reached.
    let attempts = 0;
    let frame: number;
    const scroll = () => {
      attempts += 1;
      scrollToIndexFailedRef.current = false;
      listRef.current?.scrollToIndex({ animated: true, index, viewOffset: newCommentHeight, viewPosition: 1 });
      // The item is marked as focused once the scroll stuck, so that a missed one is retried instead of lost.
      if (scrollToIndexFailedRef.current && attempts < MAX_FOCUS_SCROLL_ATTEMPTS) frame = requestAnimationFrame(scroll);
      else scrolledFocusItemRef.current = focusItem;
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [flatData, focusItem, listRef, newCommentHeight]);

  // Note: FlatList is used instead of FlashList because it doesn't unmount clipped input elements, allowing scrolling to current editing item from everwhere.

  return (
    <CommentsThreadContext value={context}>
      <Animated.FlatList
        {...(props as FlatListPropsWithLayout<CommentsThreadInternals.Item>)}
        ref={useSyncRef(listRef, ref)}
        onLayout={onLayout}
        keyboardDismissMode="interactive"
        onScroll={onScroll}
        onScrollToIndexFailed={onScrollToIndexFailed}
        renderScrollComponent={renderScrollComponent}
        data={flatData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
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
