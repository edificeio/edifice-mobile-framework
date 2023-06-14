import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import { getNewsItemsAction, getNewsItemsForSelectedThreadAction, getNewsThreadsAction } from '~/framework/modules/newsv2/actions';
import NoNewsScreen from '~/framework/modules/newsv2/components/empty-screen';
import NewsCard from '~/framework/modules/newsv2/components/news-card';
import NewsPlaceholderHome from '~/framework/modules/newsv2/components/placeholder/home';
import ThreadsSelector from '~/framework/modules/newsv2/components/threads-selector';
import { NewsItem, NewsThreadItem } from '~/framework/modules/newsv2/model';
import { NewsNavigationParams, newsRouteNames } from '~/framework/modules/newsv2/navigation';
import { getNewsRights } from '~/framework/modules/newsv2/rights';
import { navBarOptions } from '~/framework/navigation/navBar';
import { isEmpty } from '~/framework/util/object';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import { NewsHomeScreenDataProps, NewsHomeScreenEventProps, NewsHomeScreenProps, NewsThreadItemReduce } from './types';

const convertArrayToObject = (array: NewsThreadItem[], key) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: { title: item.title, icon: item.icon, rights: item.rights },
    };
  }, initialValue);
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<NewsNavigationParams, typeof newsRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('news-appName'),
  }),
});

const NewsHomeScreen = (props: NewsHomeScreenProps) => {
  const { navigation, session } = props;

  const [threads, setThreads] = useState<NewsThreadItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [idThreadSelected, setIdThreadSelected] = useState<number | null>(null);
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true);
  const [loadingState, setLoadingState] = useState<AsyncPagedLoadingState>(AsyncPagedLoadingState.INIT);

  const threadsInfosReduce = useMemo(() => convertArrayToObject(threads, 'id'), [threads]);
  const wf = useMemo(() => getNewsRights(session!), [session]);
  const canCreateNewsForSelectedThread: boolean = React.useMemo(
    () => (idThreadSelected ? !isEmpty(threadsInfosReduce[idThreadSelected].rights) : false),
    [idThreadSelected, threadsInfosReduce],
  );
  const canCreateNewsForOneThread: boolean = React.useMemo(() => threads?.some(thread => !isEmpty(thread.rights)), [threads]);

  const onOpenNewsItem = useCallback(
    (item: NewsItem, thread: NewsThreadItemReduce) => {
      navigation.navigate(newsRouteNames.details, {
        news: item,
        thread,
      });
    },
    [navigation],
  );

  const renderError = () => {
    return <EmptyContentScreen />;
  };

  const onFilter = useCallback(async (idThread: number | null) => {
    try {
      setIdThreadSelected(idThread);

      let data;
      if (idThread === null) data = await props.handleGetNewsItems();
      else data = await props.handleGetNewsItemsForSelectedThread(idThread);

      setNews(data);
    } catch (e) {
      // TODO ERROR
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    try {
      const data = await Promise.all([props.handleGetNewsThreads(), props.handleGetNewsItems()]);

      setThreads(data[0]);
      setNews(data[1]);
      setShowPlaceholder(false);
      setLoadingState(AsyncPagedLoadingState.DONE);
    } catch (e) {
      setShowPlaceholder(false);
      renderError();
      //TODO ERROR
      console.log(e);
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPage = useCallback(() => {
    // empty screen with create threads button when no threads, news && can create threads
    if (isEmpty(threads) && isEmpty(news) && wf.threads.create) return <NoNewsScreen createThreads />;
    // empty screen with create news button when only one thread && no news && can create news on this thread
    if (threads.length === 1 && isEmpty(news) && !isEmpty(threads[0].rights)) return <NoNewsScreen createNews />;
    // empty screen with no button when only one thread && no news or no threads && no news
    if ((threads.length === 1 && isEmpty(news)) || (isEmpty(threads) && isEmpty(news))) return <NoNewsScreen />;

    return (
      <FlatList
        style={[styles.flatlist, threads.length <= 1 ? styles.flatlistNoThreadSelector : null]}
        data={news}
        renderItem={({ item }: { item: NewsItem }) => {
          const newsThread: NewsThreadItemReduce = threadsInfosReduce[`${item.threadId}`];
          return <NewsCard news={item} thread={newsThread} onPress={() => onOpenNewsItem(item, newsThread)} />;
        }}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={threads.length > 1 ? <ThreadsSelector threads={threads} onSelect={id => onFilter(id)} /> : undefined}
        ListEmptyComponent={
          <NoNewsScreen createNews={idThreadSelected ? canCreateNewsForSelectedThread : canCreateNewsForOneThread} />
        }
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => init()} />}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canCreateNewsForOneThread,
    canCreateNewsForSelectedThread,
    idThreadSelected,
    news,
    onFilter,
    onOpenNewsItem,
    threads,
    threadsInfosReduce,
    wf.threads.create,
  ]);

  return <PageView>{showPlaceholder ? <NewsPlaceholderHome /> : renderPage()}</PageView>;
};

const mapStateToProps: (s: IGlobalState) => NewsHomeScreenDataProps = s => ({
  session: getSession(),
});

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => NewsHomeScreenEventProps = (
  dispatch,
  getState,
) => ({
  handleGetNewsThreads: async () => {
    return (await dispatch(getNewsThreadsAction())) as NewsThreadItem[];
  },
  handleGetNewsItems: async () => {
    return (await dispatch(getNewsItemsAction())) as NewsItem[];
  },
  handleGetNewsItemsForSelectedThread: async (threadId: number) => {
    return (await dispatch(getNewsItemsForSelectedThreadAction(threadId))) as NewsItem[];
  },
});

const NewsHomeScreenConnected = connect(mapStateToProps, mapDispatchToProps)(NewsHomeScreen);
export default NewsHomeScreenConnected;
