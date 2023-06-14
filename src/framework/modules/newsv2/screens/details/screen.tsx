import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Viewport } from '@skele/components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, RefreshControl, View } from 'react-native';
import { KeyboardAvoidingFlatList } from 'react-native-keyboard-avoiding-scroll-view';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import BottomEditorSheet from '~/framework/components/BottomEditorSheet';
import { ResourceView } from '~/framework/components/card';
import CardFooter from '~/framework/components/card/footer';
import CardTopContent from '~/framework/components/card/top-content';
import CommentField from '~/framework/components/commentField';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import FlatList from '~/framework/components/list/flat-list';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { NavBarAction } from '~/framework/components/navigation';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { CaptionItalicText, HeadingSText } from '~/framework/components/text';
import { TextAvatar } from '~/framework/components/textAvatar';
import { getSession } from '~/framework/modules/auth/reducer';
import { commentsString } from '~/framework/modules/blog/components/BlogPostResourceCard';
import { deleteCommentNewsItemAction, deleteNewsItemAction, getNewsItemCommentsAction } from '~/framework/modules/newsv2/actions';
import NewsPlaceholderDetails from '~/framework/modules/newsv2/components/placeholder/details';
import ThumbnailThread from '~/framework/modules/newsv2/components/thumbnail-thread';
import { NewsCommentItem, NewsItem, NewsItemRights, NewsThreadItemRights } from '~/framework/modules/newsv2/model';
import { NewsNavigationParams, newsRouteNames } from '~/framework/modules/newsv2/navigation';
import { NewsThreadItemReduce } from '~/framework/modules/newsv2/screens/home/types';
import { navBarOptions } from '~/framework/navigation/navBar';
import { displayDate } from '~/framework/util/date';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import HtmlContentView from '~/ui/HtmlContentView';

import styles from './styles';
import { NewsDetailsScreenDataProps, NewsDetailsScreenEventProps, NewsDetailsScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<NewsNavigationParams, typeof newsRouteNames.details>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('news.appName'),
  }),
});

//TODO: delete setTimeout for showPlaceholder

const NewsDetailsScreen = (props: NewsDetailsScreenProps) => {
  const { route, session, navigation } = props;

  const [news, setNews] = useState<NewsItem>();
  const [thread, setThread] = useState<NewsThreadItemReduce>();
  const [comments, setComments] = useState<NewsCommentItem[]>();
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true);
  const [loadingState, setLoadingState] = useState<AsyncPagedLoadingState>(AsyncPagedLoadingState.INIT);

  const isThreadManager = useMemo(() => thread?.rights.includes(NewsThreadItemRights.MANAGER), [thread]);
  const hasPermissionDelete = useMemo(() => {
    return session!.user.id === news?.owner.id || isThreadManager;
  }, [news, session, isThreadManager]);
  const hasPermissionComment = useMemo(() => news?.rights.includes(NewsItemRights.COMMENT), [news]);

  const ListComponent = Platform.select<React.ComponentType<any>>({
    ios: FlatList,
    android: KeyboardAvoidingFlatList,
  })!;
  const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

  const renderError = useCallback(() => {
    return (
      <ScrollView
      //TODO : add resfreshcontrol
      >
        <EmptyContentScreen />
      </ScrollView>
    );
  }, []);

  const renderFooter = useCallback(() => {
    return hasPermissionComment ? (
      <BottomEditorSheet
        //TODO add ref
        onPublishComment={() => console.log('publish')}
        isPublishingComment={false}
        onChangeText={data => console.log('change text', data)}
      />
    ) : (
      <View />
    );
  }, [hasPermissionComment]);

  const renderNewsDetails = useCallback(() => {
    if (news && thread) {
      return (
        <ResourceView
          header={
            <CardTopContent
              image={<ThumbnailThread icon={thread.icon} square />}
              text={thread.title}
              {...(news.headline ? { statusIcon: 'ui-starFilled', statusColor: theme.palette.complementary.orange.regular } : null)}
              style={styles.detailsHeaderTopContent}
            />
          }
          customHeaderStyle={styles.detailsHeader}
          footer={<CardFooter icon="ui-messageInfo" text={commentsString(comments?.length)} />}
          style={styles.ressourceView}>
          <CaptionItalicText style={styles.detailsDate}>{displayDate(news.created)}</CaptionItalicText>
          <HeadingSText>{news.title}</HeadingSText>
          <TextAvatar
            text={news.owner.displayName}
            userId={news.owner.id}
            isHorizontal
            size={UI_SIZES.elements.icon}
            viewStyle={styles.detailsOwner}
          />
          <HtmlContentView html={news.content} />
        </ResourceView>
      );
    }
  }, [news, thread, comments]);

  const renderComment = useCallback(
    (comment: NewsCommentItem) => {
      return (
        <CommentField
          index={comment.id}
          isPublishingComment={false}
          onPublishComment={() => console.log('publish')}
          onDeleteComment={() => {
            Alert.alert(I18n.get('common.deletion'), I18n.get('common.comment.confirmationDelete'), [
              {
                text: I18n.get('common.cancel'),
                style: 'default',
              },
              {
                text: I18n.get('common.delete'),
                style: 'destructive',
                onPress: () => props.handleDeleteComment(news?.id, comment.id),
              },
            ]);
          }}
          onChangeText={data => console.log('change text', data)}
          editCommentCallback={() => console.log('edit comment')}
          comment={comment.comment}
          commentId={comment.id}
          commentAuthorId={comment.owner}
          commentAuthor={comment.username}
          commentDate={comment.created}
          isManager={isThreadManager}
        />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isThreadManager],
  );

  const getComments = async (newsInfo: NewsItem) => {
    const newsItemComments = await props.handleGetNewsItemComments(newsInfo.id);
    setComments(newsItemComments);
  };

  const init = async () => {
    try {
      if (route.params.news && route.params.thread) {
        setNews(route.params.news);
        setThread(route.params.thread);
        await getComments(route.params.news);
      } else {
        //TODO: appel api get news
      }

      setShowPlaceholder(false);
      setLoadingState(AsyncPagedLoadingState.DONE);
    } catch (e) {
      setShowPlaceholder(false);
      renderError();
      //TODO ERROR
      console.log(e);
    }
  };

  const renderPage = useCallback(() => {
    return (
      <>
        <Viewport.Tracker>
          <ListComponent
            initialNumToRender={comments?.length}
            keyboardShouldPersistTaps="handled"
            data={comments}
            keyExtractor={(item: NewsCommentItem) => item.id.toString()}
            ListHeaderComponent={renderNewsDetails}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => renderComment(item)}
            refreshControl={
              <RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => init()} />
            }
            scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
            {...Platform.select({ ios: {}, android: { stickyFooter: renderFooter() } })}
          />
        </Viewport.Tracker>
        {Platform.select({ ios: renderFooter(), android: null })}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ListComponent, comments, renderComment, renderFooter, renderNewsDetails]);

  useEffect(() => {
    if (hasPermissionDelete) {
      navigation.setOptions({
        // eslint-disable-next-line react/no-unstable-nested-components
        headerRight: () => (
          <PopupMenu
            actions={[
              deleteAction({
                action: async () => {
                  try {
                    if (news) await props.handleDeleteInfo(news.threadId, news.id).then(navigation.goBack());
                  } catch (e) {
                    console.log(e);
                  }
                },
              }),
            ]}>
            <NavBarAction icon="ui-options" />
          </PopupMenu>
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermissionDelete]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageComponent {...Platform.select({ ios: { safeArea: !hasPermissionComment }, android: {} })}>
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
  handleGetNewsItemComments: async (newsItemId: number) => {
    return (await dispatch(getNewsItemCommentsAction(newsItemId))) as NewsCommentItem[];
  },
  handleDeleteInfo: async (threadId, infoId) => {
    return (await dispatch(deleteNewsItemAction(threadId, infoId))) as unknown as number | undefined;
  },
  handleDeleteComment: async (infoId, commentId) => {
    return (await dispatch(deleteCommentNewsItemAction(infoId, commentId))) as unknown as number | undefined;
  },
});

const NewsDetailsScreenConnected = connect(mapStateToProps, mapDispatchToProps)(NewsDetailsScreen);
export default NewsDetailsScreenConnected;
