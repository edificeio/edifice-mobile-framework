import * as React from 'react';
import { Alert, Platform, View } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list';
import { KeyboardChatScrollView, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { useConfirmRemove } from '~/app/navigation/use-confirm-remove';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { FlatListProps } from '~/framework/components/list/flat-list';
import { usePrevious } from '~/framework/hooks/previous';
import { selectors } from '~/framework/modules/auth/redux/reducer';

import { SocialResourceViewerContext, socialResourceViewerContextInitialData, socialResourceViewerContextReducer } from './context';
import { SocialResourceViewerAddCommentForm } from './form';
import { useSocialCommentsData } from './hooks';
import { SocialResourceViewerItem } from './item';
import styles, { COMMENT_FORM_OVERSCROLL_SIZE } from './styles';
import { type SocialResourceViewer, SocialResourceViewerInternals } from './types';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<SocialResourceViewerInternals.Item>);

export function SocialResourceViewer({
  alwaysShowCommentField = false,
  canAddComment: _canAddComment,
  children,
  data,
  focusItem,
  onSubmit,
  responsesPageSize,
  responsesStartSize,
}: SocialResourceViewer.Props) {
  // User data
  const session = useSelector(selectors.session);
  const canAddComment = session && _canAddComment;

  const context = React.useReducer(socialResourceViewerContextReducer, socialResourceViewerContextInitialData);

  const { flatData, showResponses } = useSocialCommentsData(data, { responsesPageSize, responsesStartSize }, context[0]);

  // Screen layout
  const navBarHeight = useHeaderHeight();
  const { bottom: bottomInset } = useSafeAreaInsets();

  // Component layout
  const listRef = React.useRef<FlashListRef<SocialResourceViewerInternals.Item>>(null);
  const [measuredResourceHeight, setMeasuredResourceHeight] = React.useState(0);
  const [measuredListHeight, setMeasuredListHeight] = React.useState(0);

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

  useConfirmRemove(newCommentValue.length > 0 || (context[0].newResponseId !== undefined && context[0].newResponseValue !== ''), {
    text: I18n.get('comment-preventback-alert-text'),
    title: I18n.get('comment-preventback-alert-title'),
  });

  const listFooterStyle = React.useMemo(
    () => ({
      height: newCommentHeight,
    }),
    [newCommentHeight],
  );

  const onPressReply = React.useCallback<NonNullable<SocialResourceViewerInternals.ItemProps['onPressReply']>>(
    item => {
      const addReply = () => {
        context[1]({ newResponseId: item.id, newResponseValue: '' });
      };
      if (context[0].newResponseId !== undefined && context[0].newResponseValue !== '') {
        Alert.alert(I18n.get('comment-cancelreply-alert-title'), I18n.get('comment-cancelreply-alert-text'), [
          {
            onPress: addReply,
            style: 'destructive',
            text: I18n.get('common-delete'),
          },
          {
            onPress: () => {},
            style: 'default',
            text: I18n.get('common-cancel'),
          },
        ]);
        return;
      }
      addReply();
    },
    [context],
  );

  const renderItem = React.useCallback<NonNullable<FlashListProps<SocialResourceViewerInternals.Item>['renderItem']>>(
    info => (
      <SocialResourceViewerItem
        {...info}
        onShowResponses={showResponses}
        session={session}
        canAddComment={canAddComment}
        onPressReply={onPressReply}
        onSendReply={onSubmit}
      />
    ),
    [canAddComment, onPressReply, onSubmit, session, showResponses],
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
      />
      {canAddComment && (
        <SocialResourceViewerAddCommentForm
          // listRef={listRef}
          onSubmit={onSubmit}
          session={session}
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
    </SocialResourceViewerContext>
  );
}

export const SocialResourceViewerError = () => <EmptyContentScreen />;
