import * as React from 'react';
import { ScrollView } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import type { WikiReaderScreen } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import service from '~/framework/modules/wiki/service';
import { actions, selectors, WikiAction, WikiPageAction } from '~/framework/modules/wiki/store';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WikiNavigationParams, typeof wikiRouteNames.reader>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('wiki-reader-title'),
  }),
});

export default function WikiReaderScreen({
  navigation,
  route: {
    params: { pageId, resourceId },
  },
}: WikiReaderScreen.AllProps) {
  const wikiData = useSelector(selectors.wiki(resourceId)) ?? {};
  const pageData = useSelector(selectors.page(pageId)) ?? {};
  const dispatch = useDispatch<ThunkDispatch<IGlobalState, any, WikiAction | WikiPageAction>>();

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(async () => {
    const newWikiData = await service.wiki.get({ id: resourceId });
    const newPageData = await service.page.get({ id: resourceId, pageId: pageId });
    dispatch(actions.loadWiki(newWikiData));
    dispatch(actions.loadPage(resourceId, newPageData));
  }, [dispatch, resourceId, pageId]);

  const renderLoading: ContentLoaderProps['renderLoading'] = React.useCallback(
    () => <BodyBoldText>LOADING {resourceId}</BodyBoldText>,
    [resourceId],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return (
        <ScrollView refreshControl={refreshControl}>
          <BodyBoldText>
            Page {pageId} OF {resourceId} ({wikiData.name})
          </BodyBoldText>
          <BodyBoldText>{pageData.title}</BodyBoldText>
          <BodyText>{pageData.content}</BodyText>
        </ScrollView>
      );
    },
    [pageData.content, pageData.title, pageId, resourceId, wikiData.name],
  );

  return (
    <PageView>
      <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />
    </PageView>
  );
}
