import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import type { WikiSummaryScreen } from './types';

import { getStore, IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { PageList } from '~/framework/modules/wiki/components/page-list';
import ResourceHeader from '~/framework/modules/wiki/components/resource-header';
import { Wiki } from '~/framework/modules/wiki/model';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import service from '~/framework/modules/wiki/service';
import { actions, selectors, WikiAction } from '~/framework/modules/wiki/store';
import { navBarOptions } from '~/framework/navigation/navBar';
import http from '~/framework/util/http';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WikiNavigationParams, typeof wikiRouteNames.summary>): NativeStackNavigationOptions => {
  const wikiData = selectors.wiki(route.params.resourceId)(getStore().getState());
  return {
    ...navBarOptions({
      navigation,
      route,
      title: wikiData?.name ?? '',
    }),
    headerShadowVisible: false,
  };
};

export function WikiSummaryScreenLoaded({
  navigation,
  refreshControl,
  wiki,
}: Pick<WikiSummaryScreen.AllProps, 'navigation'> & {
  wiki: Wiki;
  refreshControl: Parameters<ContentLoaderProps['renderContent']>[0];
}) {
  const imageSource = React.useMemo(() => {
    return wiki.thumbnail ? http.imagePropsForSession({ source: { uri: wiki.thumbnail } }) : undefined;
  }, [wiki.thumbnail]);

  return (
    <PageList
      refreshControl={refreshControl}
      wikiData={wiki}
      header={<ResourceHeader canAddDescription={true} image={imageSource} description={wiki.description} />}
      onPress={page => navigation.navigate({ name: wikiRouteNames.reader, params: { pageId: page.id, resourceId: wiki.assetId } })}
    />
  );
}

export default function WikiSummaryScreen({
  navigation,
  route: {
    params: { resourceId },
  },
}: WikiSummaryScreen.AllProps) {
  const wikiData = useSelector(selectors.wiki(resourceId));
  const dispatch = useDispatch<ThunkDispatch<IGlobalState, any, WikiAction>>();
  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(async () => {
    const data = await service.wiki.get({ id: resourceId });
    dispatch(actions.loadWiki(data));
    navigation.setOptions({ title: data.name });
  }, [dispatch, navigation, resourceId]);

  const renderLoading: ContentLoaderProps['renderLoading'] = React.useCallback(
    () => <BodyBoldText>LOADING {resourceId}</BodyBoldText>,
    [resourceId],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl =>
      wikiData ? (
        <WikiSummaryScreenLoaded navigation={navigation} wiki={wikiData} refreshControl={refreshControl} />
      ) : (
        <EmptyContentScreen />
      ),
    [navigation, wikiData],
  );

  return (
    <PageView>
      <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />
    </PageView>
  );
}
