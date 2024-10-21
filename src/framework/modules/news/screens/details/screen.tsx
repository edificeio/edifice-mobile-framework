import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, Platform, RefreshControl, View } from 'react-native';

import { HeaderBackButton } from '@react-navigation/elements';
import { UNSTABLE_usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { KeyboardAvoidingFlatList } from 'react-native-keyboard-avoiding-scroll-view';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import styles from './styles';
import { NewsDetailsScreenDataProps, NewsDetailsScreenEventProps, NewsDetailsScreenProps } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import BottomEditorSheet from '~/framework/components/BottomEditorSheet';
import { ResourceView } from '~/framework/components/card';
import CardFooter from '~/framework/components/card/footer';
import CardTopContent from '~/framework/components/card/top-content';
import CommentField, { InfoCommentField } from '~/framework/components/commentField';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { NavBarAction } from '~/framework/components/navigation';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { CaptionItalicText, HeadingSText } from '~/framework/components/text';
import { TextAvatar } from '~/framework/components/textAvatar';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  deleteCommentNewsItemAction,
  deleteNewsItemAction,
  editCommentNewsItemAction,
  getNewsItemAction,
  getNewsItemCommentsAction,
  publishCommentNewsItemAction,
} from '~/framework/modules/news/actions';
import NewsPlaceholderDetails from '~/framework/modules/news/components/placeholder/details';
import ThumbnailThread from '~/framework/modules/news/components/thumbnail-thread';
import { NewsCommentItem, NewsItem, NewsItemDetails, NewsItemRights, NewsThreadItemRights } from '~/framework/modules/news/model';
import { NewsNavigationParams, newsRouteNames } from '~/framework/modules/news/navigation';
import { NewsThreadItemReduce } from '~/framework/modules/news/screens/home';
import { newsUriCaptureFunction } from '~/framework/modules/news/service';
import { clearConfirmNavigationEvent, handleRemoveConfirmNavigationEvent } from '~/framework/navigation/helper';
import { navBarOptions } from '~/framework/navigation/navBar';
import { displayDate, today } from '~/framework/util/date';
import { isEmpty } from '~/framework/util/object';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { commentsString } from '~/framework/util/string';
import HtmlContentView from '~/ui/HtmlContentView';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<NewsNavigationParams, typeof newsRouteNames.details>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('news-details-appname'),
  }),
});

const NewsDetailsScreen = (props: NewsDetailsScreenProps) => {
  const {
    handleDeleteComment,
    handleDeleteInfo,
    handleEditComment,
    handleGetNewsItem,
    handleGetNewsItemComments,
    handlePublishComment,
    navigation,
    route,
    session,
  } = props;
  const notif = route.params.notification;

  const [news, setNews] = useState<NewsItem>();
  const [thread, setThread] = useState<NewsThreadItemReduce>();
  const [comments, setComments] = useState<NewsCommentItem[]>();
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true);
  const [loadingState, setLoadingState] = useState<AsyncPagedLoadingState>(AsyncPagedLoadingState.PRISTINE);
  const [infoComment, setInfoComment] = useState<InfoCommentField>({ changed: false, isPublication: false, type: '', value: '' });
  const [indexEditingComment, setIndexEditingComment] = useState<number | undefined>(undefined);
  const [listHeight, setListHeight] = useState<number>(0);

  const isThreadManager = useMemo(
    () => thread?.sharedRights.includes(NewsThreadItemRights.MANAGER) || session!.user.id === thread?.ownerId,
    [thread, session],
  );
  const hasPermissionDelete = useMemo(() => {
    return session!.user.id === news?.owner.id || isThreadManager;
  }, [news, session, isThreadManager]);
  const hasPermissionComment = useMemo(() => {
    return news?.sharedRights.includes(NewsItemRights.COMMENT) || session!.user.id === news?.owner.id;
  }, [news, session]);

  const ListComponent = useMemo(() => {
    return Platform.select<React.ComponentType<any>>({
      android: KeyboardAvoidingFlatList,
      ios: FlatList,
    })!;
  }, []);
  const PageComponent = useMemo(() => {
    return Platform.select<typeof KeyboardPageView | typeof PageView>({ android: PageView, ios: KeyboardPageView })!;
  }, []);

  const flatListRef: { current: any } = useRef<typeof FlatList>(null);

  const commentFieldRefs: any[] = [];

  const getComments = useCallback(
    async (newsInfo: NewsItem) => {
      const newsItemComments = await handleGetNewsItemComments(newsInfo.id);
      setComments(newsItemComments);
    },
    [handleGetNewsItemComments],
  );

  const onRefresh = useCallback(
    async (infoId: number) => {
      try {
        const data = await handleGetNewsItem(infoId);
        setNews(data.news);
        setThread(data.thread);
        await getComments(data.news);
      } catch {
        setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED);
        throw new Error();
      }
    },
    [getComments, handleGetNewsItem],
  );

  const init = useCallback(async () => {
    try {
      if (route.params.news && route.params.thread) {
        setNews(route.params.news);
        setThread(route.params.thread);
        await getComments(route.params.news);
      } else if (notif) {
        const infoId = newsUriCaptureFunction(notif.resource.uri);
        await onRefresh(infoId);
      } else {
        setLoadingState(AsyncPagedLoadingState.INIT_FAILED);
        throw new Error();
      }

      setShowPlaceholder(false);
      setLoadingState(AsyncPagedLoadingState.DONE);
    } catch {
      setShowPlaceholder(false);
      setLoadingState(AsyncPagedLoadingState.INIT_FAILED);
    }
  }, [getComments, notif, onRefresh, route.params.news, route.params.thread]);

  const showAlertError = useCallback(() => {
    Alert.alert(I18n.get('news-details-error-title'), I18n.get('news-details-error-text'));
  }, []);

  const doDeleteNews = useCallback(() => {
    try {
      Alert.alert(I18n.get('news-details-deletion-title'), I18n.get('news-details-deletion-text'), [
        {
          style: 'default',
          text: I18n.get('common-cancel'),
        },
        {
          onPress: () => handleDeleteInfo(news?.threadId, news?.id).then(() => navigation.goBack()),
          style: 'destructive',
          text: I18n.get('common-delete'),
        },
      ]);
    } catch {
      showAlertError();
    }
  }, [handleDeleteInfo, navigation, news, showAlertError]);

  const doDeleteComment = useCallback(
    async commentId => {
      Alert.alert(I18n.get('news-details-deletion'), I18n.get('news-details-deleteconfirmation'), [
        {
          style: 'default',
          text: I18n.get('common-cancel'),
        },
        {
          onPress: async () => {
            try {
              if (news) {
                if (indexEditingComment) setIndexEditingComment(undefined);
                await handleDeleteComment(news?.id, commentId);
                await getComments(news);
              }
            } catch {
              showAlertError();
            }
          },
          style: 'destructive',
          text: I18n.get('common-delete'),
        },
      ]);
    },
    [getComments, handleDeleteComment, indexEditingComment, news, showAlertError],
  );

  const doPublishComment = useCallback(
    async (newsItem, comment) => {
      try {
        await handlePublishComment(newsItem?.id, comment);
        await getComments(newsItem);

        setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: listHeight,
          });
        }, 100);
      } catch {
        showAlertError();
      }
    },
    [getComments, handlePublishComment, listHeight, showAlertError],
  );

  const doEditComment = useCallback(
    async (newsItem, comment, commentId) => {
      try {
        await handleEditComment(newsItem?.id, comment, commentId);
        await getComments(newsItem);
        setIndexEditingComment(undefined);
      } catch {
        showAlertError();
      }
    },
    [getComments, handleEditComment, showAlertError],
  );

  const renderError = useCallback(() => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => init()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  }, [init, loadingState]);

  const renderFooter = useCallback(() => {
    return hasPermissionComment && isEmpty(indexEditingComment) ? (
      <BottomEditorSheet
        onPublishComment={commentValue => doPublishComment(news, commentValue)}
        isPublishingComment={false}
        onChangeText={data => setInfoComment(() => ({ ...data }))}
      />
    ) : (
      <View />
    );
  }, [doPublishComment, hasPermissionComment, indexEditingComment, infoComment, news]);

  const renderNewsDetails = useCallback(() => {
    if (news && thread) {
      return (
        <ResourceView
          header={
            <CardTopContent
              image={<ThumbnailThread icon={thread.icon} square />}
              text={thread.title}
              {...(news.headline
                ? { statusColor: theme.palette.complementary.orange.regular, statusIcon: 'ui-star-filled' }
                : null)}
              style={styles.detailsHeaderTopContent}
            />
          }
          customHeaderStyle={styles.detailsHeader}
          footer={<CardFooter icon="ui-messageInfo" text={commentsString(comments?.length)} />}
          style={styles.ressourceView}>
          <CaptionItalicText style={styles.detailsDate}>
            {moment(news.modified).isAfter(news.created)
              ? `${displayDate(news.modified) + I18n.get('news-details-modified')}`
              : displayDate(news.modified)}
          </CaptionItalicText>
          <HeadingSText>{news.title}</HeadingSText>
          <TextAvatar
            text={news.owner.displayName}
            userId={news.owner.id}
            isHorizontal
            size={UI_SIZES.elements.icon.default}
            viewStyle={styles.detailsOwner}
          />
          <HtmlContentView html={news.content} />
        </ResourceView>
      );
    }
  }, [comments?.length, news, thread]);

  const renderComment = useCallback(
    (comment: NewsCommentItem) => {
      return (
        <CommentField
          ref={element => (commentFieldRefs[comment.id] = element)}
          index={comment.id}
          isPublishingComment={false}
          onPublishComment={(commentValue, commentId) => doEditComment(news, commentValue, commentId)}
          onDeleteComment={commentId => doDeleteComment(commentId)}
          onChangeText={data => setInfoComment(() => ({ ...data }))}
          editCommentCallback={() => {
            const otherComments = comments?.filter(commentItem => commentItem.id !== comment.id);
            otherComments?.forEach(otherBlogPostComment => {
              commentFieldRefs[otherBlogPostComment.id]?.setIsEditingFalse();
            });
            const commentIndex = comments?.findIndex(c => c.id === comment.id);

            if (Platform.OS !== 'ios') {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: commentIndex,
                  viewPosition: 1,
                });
              }, 100);
            }

            setIndexEditingComment(commentIndex);
          }}
          comment={comment.comment}
          commentId={comment.id}
          commentAuthorId={comment.owner}
          commentAuthor={comment.username}
          commentDate={comment.created}
          isManager={isThreadManager}
        />
      );
    },
    [commentFieldRefs, comments, doDeleteComment, doEditComment, infoComment.value, isThreadManager, news],
  );

  const renderPage = useCallback(() => {
    if (
      loadingState === (AsyncPagedLoadingState.INIT_FAILED || AsyncPagedLoadingState.REFRESH_FAILED) ||
      (news?.expirationDate && today().isAfter(news.expirationDate))
    )
      return renderError();
    return (
      <>
        <ListComponent
          ref={flatListRef}
          initialNumToRender={comments?.length}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item: NewsCommentItem) => item.id.toString()}
          data={comments}
          ListHeaderComponent={renderNewsDetails}
          removeClippedSubviews={false}
          renderItem={({ index, item }) => renderComment(item)}
          onContentSizeChange={(width, height) => setListHeight(height)}
          refreshControl={
            <RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => onRefresh(news?.id)} />
          }
          scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
          {...Platform.select({ android: { stickyFooter: renderFooter() }, ios: {} })}
        />
        {Platform.select({ android: null, ios: renderFooter() })}
      </>
    );
  }, [ListComponent, comments, loadingState, news?.id, onRefresh, renderComment, renderError, renderFooter, renderNewsDetails]);

  useEffect(() => {
    if (hasPermissionDelete) {
      navigation.setOptions({
        headerRight: () => (
          <PopupMenu actions={[deleteAction({ action: doDeleteNews })]}>
            <NavBarAction icon="ui-options" />
          </PopupMenu>
        ),
      });
    }
  }, [doDeleteNews, hasPermissionDelete, navigation]);

  useEffect(() => {
    init();
    if (route.params.page) {
      navigation.setOptions({
        headerLeft: () => (
          <HeaderBackButton
            labelVisible={false}
            tintColor={theme.palette.grey.white as string}
            onPress={() => navigation.navigate(newsRouteNames.home, { page: route.params.page })}
          />
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardSubscription = Keyboard.addListener('keyboardDidShow', event => {
        setTimeout(() => {
          if (indexEditingComment !== undefined && indexEditingComment > -1) {
            flatListRef.current?.scrollToIndex({
              index: indexEditingComment,
              viewPosition: 1,
            });
          }
        }, 50);
      });
      return () => keyboardSubscription.remove();
    }
  }, [indexEditingComment]);

  UNSTABLE_usePreventRemove(infoComment.changed, ({ data }) => {
    Alert.alert(
      I18n.get(
        infoComment.isPublication
          ? 'news-details-confirmation-unsaved-publication'
          : 'news-details-confirmation-unsaved-modification',
      ),
      I18n.get(
        `news-details-${infoComment.type}-confirmation-unsaved-${infoComment.isPublication ? 'publication' : 'modification'}`,
      ),
      [
        {
          onPress: () => {
            handleRemoveConfirmNavigationEvent(data.action, navigation);
          },
          style: 'destructive',
          text: I18n.get('common-quit'),
        },
        {
          onPress: () => {
            clearConfirmNavigationEvent();
          },
          style: 'default',
          text: I18n.get('common-continue'),
        },
      ],
    );
  });

  return (
    <PageComponent {...Platform.select({ android: {}, ios: { safeArea: !hasPermissionComment } })}>
      {showPlaceholder ? <NewsPlaceholderDetails /> : renderPage()}
    </PageComponent>
  );
};

const mapStateToProps: (s: IGlobalState) => NewsDetailsScreenDataProps = s => ({
  session: getSession(),
});

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => NewsDetailsScreenEventProps = (
  dispatch,
  getState,
) => ({
  handleDeleteComment: async (infoId, commentId) => {
    return (await dispatch(deleteCommentNewsItemAction(infoId, commentId))) as unknown as number | undefined;
  },
  handleDeleteInfo: async (threadId, infoId) => {
    return (await dispatch(deleteNewsItemAction(threadId, infoId))) as unknown as number | undefined;
  },
  handleEditComment: async (infoId: number, comment: string, commentId: number) => {
    return (await dispatch(editCommentNewsItemAction(infoId, comment, commentId))) as unknown as number | undefined;
  },
  handleGetNewsItem: async (infoId: number) => {
    return (await dispatch(getNewsItemAction(infoId))) as NewsItemDetails;
  },
  handleGetNewsItemComments: async (newsItemId: number) => {
    return (await dispatch(getNewsItemCommentsAction(newsItemId))) as NewsCommentItem[];
  },
  handlePublishComment: async (infoId: number, comment: string) => {
    return (await dispatch(publishCommentNewsItemAction(infoId, comment))) as unknown as number | undefined;
  },
});

const NewsDetailsScreenConnected = connect(mapStateToProps, mapDispatchToProps)(NewsDetailsScreen);
export default NewsDetailsScreenConnected;
