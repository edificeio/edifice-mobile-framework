import * as React from 'react';
import { ScrollView, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { WikiPage } from '../../model';
import styles from './styles';
import type { WikiReaderScreen } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { SingleAvatar } from '~/framework/components/avatar';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text/viewer';
import { PageView } from '~/framework/components/page';
import { BodyBoldText, HeadingMText, SmallText } from '~/framework/components/text';
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

  const pageIndex = React.useMemo(() => wikiData.pages.findIndex(p => (p.id = pageId)), [pageId, wikiData.pages]);
  const prevPageId = React.useMemo(
    () => (pageIndex > 0 ? wikiData.pages.at(pageIndex - 1)?.id : undefined),
    [pageIndex, wikiData.pages],
  );
  const nextPageId = React.useMemo(
    () => (pageIndex !== -1 ? wikiData.pages.at(pageIndex + 1)?.id : undefined),
    [pageIndex, wikiData.pages],
  );
  console.debug('INDEX', wikiData.pages, pageId, pageIndex, prevPageId, nextPageId);

  const switchToPage = React.useCallback(
    (id: WikiPage['id']) => {
      navigation.replace(wikiRouteNames.reader, { pageId: id, resourceId });
    },
    [navigation, resourceId],
  );

  const [webViewReady, setWebViewReady] = React.useState(false);

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(async () => {
    const newWikiData = await service.wiki.get({ id: resourceId });
    const newPageData = await service.page.get({ id: resourceId, pageId: pageId });
    console.debug('LOAD PAGE', pageId, newPageData.id, newPageData.title);
    dispatch(actions.loadWiki(newWikiData));
    dispatch(actions.loadPage(resourceId, newPageData));
  }, [dispatch, resourceId, pageId]);

  const renderLoading: ContentLoaderProps['renderLoading'] = React.useCallback(
    () => (
      <View style={styles.loader}>
        <BodyBoldText>LOADING {resourceId}</BodyBoldText>
      </View>
    ),
    [resourceId],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return (
        <>
          <ScrollView refreshControl={refreshControl}>
            <View style={styles.topNavigation} />
            <View style={styles.header}>
              {!pageData.isVisible && <BodyBoldText>{I18n.get('wiki-page-hidden')}</BodyBoldText>}
              <HeadingMText>{pageData.title}</HeadingMText>
              <View style={styles.headerAuthorInfo}>
                <SingleAvatar userId={pageData.creatorId} size="md" />
                <View style={styles.headerAuthorInfoText}>
                  <BodyBoldText numberOfLines={1}>{pageData.creatorName}</BodyBoldText>
                  <SmallText numberOfLines={1}>
                    {I18n.get('wiki-page-published-at', { date: I18n.date(pageData.updatedAt ?? pageData.createdAt) })}
                  </SmallText>
                </View>
              </View>
            </View>
            <View style={styles.content}>
              <RichEditorViewer content={pageData.content} onLoad={() => setWebViewReady(true)} />
            </View>
            <View style={styles.bottomNavigation}>
              <TertiaryButton
                iconLeft="ui-arrowLeft"
                disabled={!prevPageId}
                text={I18n.get('wiki-page-previous')}
                action={() => {
                  switchToPage(prevPageId!);
                }}
              />
              <TertiaryButton
                iconRight="ui-arrowRight"
                disabled={!nextPageId}
                text={I18n.get('wiki-page-next')}
                action={() => {
                  switchToPage(nextPageId!);
                }}
              />
            </View>
          </ScrollView>
          {!webViewReady && <View style={styles.webViewPlaceholder}>{renderLoading()}</View>}
        </>
      );
    },
    [
      nextPageId,
      pageData.content,
      pageData.createdAt,
      pageData.creatorId,
      pageData.creatorName,
      pageData.isVisible,
      pageData.title,
      pageData.updatedAt,
      prevPageId,
      renderLoading,
      switchToPage,
      webViewReady,
    ],
  );

  return (
    <PageView style={styles.page}>
      <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />
    </PageView>
  );
}
