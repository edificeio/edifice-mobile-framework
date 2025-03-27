import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import type { WikiSummaryScreen } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import service from '~/framework/modules/wiki/service';
import { actions, selectors, WikiAction } from '~/framework/modules/wiki/store';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WikiNavigationParams, typeof wikiRouteNames.summary>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('wiki-summary-title'),
  }),
});

export default function WikiSummaryScreen({
  route: {
    params: { resourceId },
  },
}: WikiSummaryScreen.AllProps) {
  const wikiData = useSelector(selectors.wiki(resourceId)) ?? {};
  const dispatch = useDispatch<ThunkDispatch<IGlobalState, any, WikiAction>>();
  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(async () => {
    const data = await service.wiki.get({ id: resourceId });
    dispatch(actions.loadWiki(data));
  }, [dispatch, resourceId]);

  const renderLoading: ContentLoaderProps['renderLoading'] = React.useCallback(
    () => <BodyBoldText>LOADING {resourceId}</BodyBoldText>,
    [resourceId],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return (
        <ScrollView refreshControl={refreshControl}>
          <BodyBoldText>loaded :) {resourceId}</BodyBoldText>
          <BodyBoldText>{wikiData.name}</BodyBoldText>
          <BodyBoldText>{wikiData.description}</BodyBoldText>
          <BodyBoldText>– – – – –</BodyBoldText>
          {wikiData.pages.map(page => (
            <BodyText key={page.id}>
              {page.position} {new Array(page.depth).fill('–').join(' ')} {page.title} {page.isVisible ? '<.>' : '</>'}
            </BodyText>
          ))}
        </ScrollView>
      );
    },
    [resourceId, wikiData.description, wikiData.name, wikiData.pages],
  );

  return (
    <PageView>
      <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />
    </PageView>
  );
}
