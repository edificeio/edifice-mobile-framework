import * as React from 'react';
import { Alert, FlatList, Platform, TextInput, View } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { KeyboardChatScrollView, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { useConfirmRemove } from '~/app/navigation/use-confirm-remove';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { FlatListProps } from '~/framework/components/list/flat-list';
import { Svg } from '~/framework/components/picture';
import { CaptionText, SmallBoldText } from '~/framework/components/text';
import { usePrevious } from '~/framework/hooks/previous';
import { selectors } from '~/framework/modules/auth/redux/reducer';

import { CommentsThreadContext, commentsThreadContextInitialData, commentsThreadContextReducer } from './context';
import { CommentsThreadAddForm } from './form';
import { DEFAULT_CONFIG, useCommentsThreadData } from './hooks';
import { CommentsThread as CommentsThreadComponents } from './item';
import styles, { COMMENT_FORM_OVERSCROLL_SIZE } from './styles';
import { CommentsThreadInternals, CommentsThreadProps } from './types';

export function CommentsThreadTemplate({
  allowReplies = DEFAULT_CONFIG.allowReplies,
  alwaysShowCommentField = false,
  canAddComment: _canAddComment,
  children,
  data,
  focusItem,
  navigation,
  onDelete,
  onEdit,
  onSubmit,
  refreshControl,
  repliesPageSize,
  repliesStartSize,
}: CommentsThreadProps) {
  // User data
  const session = useSelector(selectors.session);
  const canAddComment = session && _canAddComment;

  const context = React.useReducer(commentsThreadContextReducer, commentsThreadContextInitialData);

  const { flatData, unfoldReplies } = useCommentsThreadData(data, context[0], {
    allowReplies,
    repliesPageSize,
    repliesStartSize,
  });

  // Screen layout
  const navBarHeight = useHeaderHeight();
  const { bottom: bottomInset } = useSafeAreaInsets();

  // Component layout
  const listRef = React.useRef<FlatList<CommentsThreadInternals.Item>>(null);
  const [measuredResourceHeight, setMeasuredResourceHeight] = React.useState(0);
  const [measuredListHeight, setMeasuredListHeight] = React.useState(0);
  const inlineEditRef = React.useRef<TextInput>(null);

  // Input state
  const { newCommentHeight, newCommentValue } = context[0];
  const [isNewCommentFocused, setNewCommentIsFocused] = React.useState(false);
  const alwaysShowNewCommentForm = alwaysShowCommentField || isNewCommentFocused || newCommentValue.length > 0;

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
      newCommentHeight +
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
  }, [measuredListHeight, measuredResourceHeight, newCommentHeight, alwaysShowNewCommentForm, bottomInset]);

  const renderScrollComponent = React.useCallback<
    NonNullable<FlatListProps<CommentsThreadInternals.Item>['renderScrollComponent']>
  >(
    props => (
      <KeyboardChatScrollView
        {...props}
        keyboardLiftBehavior="whenAtEnd"
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

  const resourceElement = React.useMemo(() => {
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
      bottom: newCommentHeight,
    }),
    [newCommentHeight],
  );

  const listFooterStyle = React.useMemo(
    () => ({
      height: newCommentHeight,
    }),
    [newCommentHeight],
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
    [allowReplies, canAddComment, onEdit, onPressDelete, onPressEdit, onPressReply, unfoldReplies],
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
        viewOffset: newCommentHeight,
        viewPosition: 1,
      });
  }

  // Note: FlatList is used instead of FlashList because it doesn't unmount clipped input elements, allowing scrolling to current editing item from everwhere.

  return (
    <CommentsThreadContext value={context}>
      <Animated.FlatList
        ref={listRef}
        onLayout={onLayout}
        keyboardDismissMode="interactive"
        onScroll={scrollHandler}
        renderScrollComponent={renderScrollComponent}
        data={flatData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={resourceElement}
        ListFooterComponent={<View style={listFooterStyle} />}
        scrollIndicatorInsets={scrollIndicatorInsets}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        ListEmptyComponent={<CommentsThreadEmpty canAddComment={canAddComment ?? false} />}
      />
      {canAddComment && !isInlineEditing && (
        <CommentsThreadAddForm onSubmit={onSubmit} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
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
