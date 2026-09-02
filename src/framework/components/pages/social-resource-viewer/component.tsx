import * as React from 'react';
import { Alert, Platform, TextInput, View } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list';
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

import { SocialResourceViewerContext, socialResourceViewerContextInitialData, socialResourceViewerContextReducer } from './context';
import { SocialResourceViewerAddCommentForm } from './form';
import { DEFAULT_CONFIG, useSocialCommentsData } from './hooks';
import { SocialResourceViewerItem } from './item';
import styles, { COMMENT_FORM_OVERSCROLL_SIZE } from './styles';
import { type SocialResourceViewer, SocialResourceViewerInternals } from './types';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<SocialResourceViewerInternals.Item>);

export function SocialResourceViewer({
  allowResponses = DEFAULT_CONFIG.allowResponses,
  alwaysShowCommentField = false,
  canAddComment: _canAddComment,
  children,
  data,
  focusItem,
  onDelete,
  onEdit,
  onSubmit,
  refreshControl,
  responsesPageSize,
  responsesStartSize,
}: SocialResourceViewer.Props) {
  // User data
  const session = useSelector(selectors.session);
  const canAddComment = session && _canAddComment;

  const context = React.useReducer(socialResourceViewerContextReducer, socialResourceViewerContextInitialData);

  const { flatData, showResponses } = useSocialCommentsData(data, context[0], {
    allowResponses,
    responsesPageSize,
    responsesStartSize,
  });

  // Screen layout
  const navBarHeight = useHeaderHeight();
  const { bottom: bottomInset } = useSafeAreaInsets();

  // Component layout
  const listRef = React.useRef<FlashListRef<SocialResourceViewerInternals.Item>>(null);
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
    NonNullable<FlatListProps<SocialResourceViewerInternals.Item>['renderScrollComponent']>
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

  useConfirmRemove(
    newCommentValue.length > 0 || (context[0].newResponseReplyTo !== undefined && context[0].newResponseValue !== ''),
    {
      text: I18n.get('comment-preventback-alert-text'),
      title: I18n.get('comment-preventback-alert-title'),
    },
  );

  const listFooterStyle = React.useMemo(
    () => ({
      height: newCommentHeight,
    }),
    [newCommentHeight],
  );

  const isRedactingResponse = React.useCallback(
    (item: SocialResourceViewerInternals.CommentItem) =>
      context[0].newResponseReplyTo !== undefined &&
      context[0].newResponseReplyTo !== item.id &&
      context[0].newResponseValue !== '',
    [context],
  );
  const isRedactingAnyResponse = React.useCallback(
    () => context[0].newResponseReplyTo !== undefined && context[0].newResponseValue !== '',
    [context],
  );
  const isRedactingComment = React.useCallback(
    (item: SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem) =>
      context[0].editId !== undefined && context[0].editId !== item.id && context[0].editHasChanges,
    [context],
  );

  const confirmQuitReply = React.useCallback((callback: () => void) => {
    Alert.alert(I18n.get('comment-cancelreply-alert-title'), I18n.get('comment-cancelreply-alert-text'), [
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

  const onPressReply = React.useCallback<NonNullable<SocialResourceViewerInternals.ItemProps['onPressReply']>>(
    item => {
      const isDifferentCommentThanBefore = context[0].newResponseReplyTo !== item.id;
      const addReply = () => {
        if (isDifferentCommentThanBefore) {
          context[1]({ newResponseReplyTo: item.id, newResponseValue: '' });
        }
        requestAnimationFrame(() => {
          inlineEditRef?.current?.focus();
        });
      };

      if (isRedactingResponse(item) && isDifferentCommentThanBefore) confirmQuitReply(addReply);
      else if (isRedactingComment(item)) confirmQuitEdit(addReply);
      else addReply();
    },
    [confirmQuitEdit, confirmQuitReply, context, isRedactingComment, isRedactingResponse],
  );

  const onPressEdit = React.useCallback<NonNullable<SocialResourceViewerInternals.ItemProps['onPressEdit']>>(
    item => {
      const beginEdit = () => {
        context[1]({ editHasChanges: false, editId: item.id, editValue: item.content });
        requestAnimationFrame(() => {
          inlineEditRef?.current?.focus();
        });
      };
      if (isRedactingAnyResponse()) confirmQuitReply(beginEdit);
      else if (isRedactingComment(item)) confirmQuitEdit(beginEdit);
      else beginEdit();
    },
    [confirmQuitEdit, confirmQuitReply, context, isRedactingAnyResponse, isRedactingComment],
  );

  const onPressDelete = React.useCallback<NonNullable<SocialResourceViewerInternals.ItemProps['onPressDelete']>>(
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

  const renderItem = React.useCallback<NonNullable<FlashListProps<SocialResourceViewerInternals.Item>['renderItem']>>(
    info => (
      <SocialResourceViewerItem
        {...info}
        allowResponses={allowResponses}
        onShowResponses={showResponses}
        canAddComment={canAddComment}
        onPressReply={onPressReply}
        onPressEdit={onPressEdit}
        onSendReply={onSubmit}
        onSendEdit={onEdit}
        onPressDelete={onPressDelete}
        inputRef={inlineEditRef}
        listRef={listRef}
      />
    ),
    [allowResponses, canAddComment, onEdit, onPressDelete, onPressEdit, onPressReply, onSubmit, showResponses],
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

  // Need a empty function to FlashLIst to enable `refreshControl`. Seems like an issue for them.
  const onRefresh = React.useMemo(() => (refreshControl !== undefined ? () => {} : undefined), [refreshControl]);

  return (
    <SocialResourceViewerContext value={context}>
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
        ListHeaderComponent={resourceElement}
        ListFooterComponent={<View style={listFooterStyle} />}
        scrollIndicatorInsets={scrollIndicatorInsets}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        onRefresh={onRefresh}
        ListEmptyComponent={<SocialResourceViewerEmpty canAddComment={canAddComment ?? false} />}
      />
      {canAddComment && (
        <SocialResourceViewerAddCommentForm onSubmit={onSubmit} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
      )}
    </SocialResourceViewerContext>
  );
}

export const SocialResourceViewerError = () => <EmptyContentScreen />;

export const SocialResourceViewerEmpty = ({ canAddComment }: Pick<SocialResourceViewer.Props, 'canAddComment'>) =>
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
