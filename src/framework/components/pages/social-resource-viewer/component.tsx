import * as React from 'react';
import { ListRenderItemInfo, Platform, View, ViewStyle } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
  useKeyboardHandler,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import styles from './styles';
import { ITEM_COMMENT, type SocialResourceViewer, type SocialResourceViewerItemType } from './types';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { ChatTextArea, ChatTextAreaProps } from '~/framework/components/inputs/text2';
import { FlatListProps } from '~/framework/components/list/flat-list';
import { BodyBoldText } from '~/framework/components/text';
import usePreventBack from '~/framework/hooks/prevent-back';
import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { selectors } from '~/framework/modules/auth/reducer';

/**
 * Note: FlashList v1 contains a bug that duplicates sticky elements. FlatList handles it correctly.
 *  That causes to lose focus on input chen scroll past to sticky position.
 * @see https://github.com/Shopify/flash-list/issues/739
 *
 * ToDo: test if FlashListv2 fixes the bug. Until then, we use FlatList.
 */

export const NewCommentInputContext = React.createContext<{ height: number; value: string }>({ height: 0, value: '' });
export const NewCommentInputDispatchContext = React.createContext<
  React.Dispatch<React.SetStateAction<{ height: number; value: string }>>
>(_ => _);

export function SocialResourceViewer({
  alwaysShowCommentField = false,
  canAddComment: _canAddComment,
  children,
  comments,
}: SocialResourceViewer.Props) {
  const session = useSelector(selectors.session);
  const canAddComment = session && _canAddComment;

  const listRef = React.useRef<Animated.FlatList<SocialResourceViewerItemType>>(null);
  const [newCommentInputState, newCommentInputDispatch] = React.useState({ height: 0, value: '' });
  const [isNewCommentFocused, setNewCommentIsFocused] = React.useState(false);
  const [jsKeyboardHeight, setJsKeyboardHeight] = React.useState(0);
  const alwaysShowNewCommentForm = alwaysShowCommentField || isNewCommentFocused || newCommentInputState.value.length > 0;

  const navBarHeight = useHeaderHeight();
  const renderScrollComponent = React.useCallback<
    NonNullable<FlatListProps<SocialResourceViewerItemType>['renderScrollComponent']>
  >(props => <KeyboardAwareScrollView {...props} extraKeyboardSpace={-navBarHeight} />, [navBarHeight]);

  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollOffset.value = event.contentOffset.y;
  });
  const [resourceHeight, setResourceHeight] = React.useState(0);
  const [listHeight, setListHeight] = React.useState(0);
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const inputStyle = useAnimatedStyle(() => {
    const translateValue =
      -scrollOffset.value -
      listHeight +
      resourceHeight +
      newCommentInputState.height +
      Math.max(-keyboardHeight.value, bottomInset + UI_SIZES.elements.tabbarHeight) -
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
  }, [listHeight, resourceHeight, newCommentInputState.height, alwaysShowNewCommentForm, bottomInset]);

  const scrollToOffset = React.useCallback((offset: number) => {
    listRef.current?.scrollToOffset({
      animated: true,
      offset,
    });
  }, []);

  useKeyboardHandler(
    {
      onStart: e => {
        'worklet';
        runOnJS(setJsKeyboardHeight)(e.height - e.progress * (UI_SIZES.elements.tabbarHeight + bottomInset));
        if (e.progress !== 1 || alwaysShowNewCommentForm) return;
        const destination = resourceHeight - e.height;
        if (scrollOffset.value >= destination) return;
        runOnJS(scrollToOffset)(destination);
      },
    },
    [resourceHeight, listRef, alwaysShowNewCommentForm],
  );

  const renderResource = React.useCallback(() => {
    return (
      <View
        onLayout={({
          nativeEvent: {
            layout: { height },
          },
        }) => {
          setResourceHeight(height);
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
    setListHeight(layout.height);
  }, []);
  const scrollIndicatorInsets = React.useMemo(
    () => ({ bottom: newCommentInputState.height + jsKeyboardHeight }),
    [newCommentInputState.height, jsKeyboardHeight],
  );

  usePreventBack({
    showAlert: newCommentInputState.value.length > 0,
    text: I18n.get('comment-preventback-alert-text'),
    title: I18n.get('comment-preventback-alert-title'),
  });

  return (
    <NewCommentInputContext value={newCommentInputState}>
      <NewCommentInputDispatchContext value={newCommentInputDispatch}>
        <Animated.FlatList<SocialResourceViewerItemType>
          ref={listRef}
          onLayout={onLayout}
          keyboardDismissMode="interactive"
          onScroll={scrollHandler}
          renderScrollComponent={renderScrollComponent}
          data={comments}
          renderItem={SocialResourceViewerItem}
          ListHeaderComponent={renderResource}
          ListFooterComponent={<View style={{ height: newCommentInputState.height }} />}
          scrollIndicatorInsets={scrollIndicatorInsets}
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
  style: ViewStyle;
  onFocus?: ChatTextAreaProps['onFocus'];
  onBlur?: ChatTextAreaProps['onBlur'];
  session: AuthActiveAccount | AuthSavedLoggedInAccount;
}) => {
  const inputState = React.useContext(NewCommentInputContext);
  const inputDispatch = React.useContext(NewCommentInputDispatchContext);
  const navBarHeight = useHeaderHeight();
  const { bottom, top } = useSafeAreaInsets();
  return (
    <Animated.View
      style={style}
      onLayout={React.useCallback(
        ({ nativeEvent: { layout } }) => {
          inputDispatch(state => ({ ...state, height: layout.height }));
        },
        [inputDispatch],
      )}>
      <KeyboardStickyView
        style={styles.stickyCommentWrapper}
        /**
         * on Android, edge-to-edge compatibility for react-native-keyboard-controller force us to make Status bar transparent and take insets into account here.
         * When edge-to-edge will be implemented at project-level, this would be no more necessary.
         */
        offset={{ closed: 0, opened: navBarHeight + (Platform.OS === 'android' ? bottom - top : 0) }}>
        <SingleAvatar size="md" userId={session.user.id} />
        <ChatTextArea
          maxLength={80}
          wrapperStyle={[UI_STYLES.flexGrow1]}
          value={inputState.value}
          onChangeText={React.useCallback<NonNullable<ChatTextAreaProps['onChangeText']>>(
            text => {
              inputDispatch(state => ({ ...state, value: text }));
            },
            [inputDispatch],
          )}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Ajouter un commentaire"
        />
        <PrimaryButton disabled={!inputState.value.length} iconLeft="ui-send" round />
      </KeyboardStickyView>
    </Animated.View>
  );
};

export const SocialResourceViewerCommentItem = (info: ListRenderItemInfo<CommentItem>) => {
  const itemStyle = React.useMemo(() => ({ padding: 16 }), []);
  return <BodyBoldText style={itemStyle}>Commentaire {info.item.value.toString()}</BodyBoldText>;
};

export const SocialResourceViewerResponseItem = (info: ListRenderItemInfo<ResponseItem>) => {
  const itemStyle = React.useMemo(() => ({ padding: 16 }), []);
  return <BodyBoldText style={itemStyle}>Réponse {info.item.value.toString()}</BodyBoldText>;
};

export const SocialResourceViewerItem = (info: ListRenderItemInfo<SocialResourceViewerItemType>) => {
  if (info.item.type === ITEM_COMMENT) {
    return <SocialResourceViewerCommentItem {...(info as ListRenderItemInfo<CommentItem>)} />;
  } else if (info.item.type === ITEM_RESPONSE) {
    return <SocialResourceViewerResponseItem {...(info as ListRenderItemInfo<ResponseItem>)} />;
  } else {
    return <BodyBoldText>ITEM INCONNU {info.item.value.toString()}</BodyBoldText>;
  }
};

export const SocialResourceViewerError = () => <EmptyContentScreen />;
