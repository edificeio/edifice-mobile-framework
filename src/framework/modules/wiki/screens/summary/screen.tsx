import * as React from 'react';
import { View } from 'react-native';

import type { StaticScreenProps } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Placeholder, PlaceholderLine } from 'rn-placeholder';

import { defineScreen, useNavigation } from '~/app/navigation-new';
import { getScaleImageSize, getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen, EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { HeadingMText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { loadWiki } from '~/framework/modules/wiki/actions';
import { WikiPageList } from '~/framework/modules/wiki/components/page-list';
import { WikiPageListProps } from '~/framework/modules/wiki/components/page-list/types';
import WikiResourceHeader from '~/framework/modules/wiki/components/resource-header';
import WikiResourceHeaderLoader from '~/framework/modules/wiki/components/resource-header-loader';
import { Wiki } from '~/framework/modules/wiki/model';
import { selectWiki, WikiDispatch } from '~/framework/modules/wiki/store';
import { sessionImageSource } from '~/framework/util/transport';
import { withSession } from '~/modules/auth/hoc';
import { toURISource } from '~/modules/media/util';
import { I18n } from '~/util/i18n';

import styles from './styles';

type WikiSummaryScreenParams = {
  resourceId: Wiki['assetId'];
};

const TITLE_PLACEHOLDER_HEIGHT = getScaleWidth(30);
const LINE_PLACEHOLDER_HEIGHT = getScaleWidth(48);

export function WikiSummaryScreenLoaded({
  refreshControl,
  wiki,
}: {
  wiki: Wiki;
  refreshControl: Parameters<ContentLoaderProps['renderContent']>[0];
}) {
  const navigation = useNavigation();
  const imageSourceProps = React.useMemo(() => {
    return wiki.thumbnail ? sessionImageSource(toURISource(wiki.thumbnail)) : undefined;
  }, [wiki.thumbnail]);

  const hasPages = wiki.pages.length > 0;
  const listHeader = React.useMemo(
    () => (
      <>
        <WikiResourceHeader image={imageSourceProps} description={wiki.description} />
        {hasPages && (
          <HeadingMText style={styles.pageListTitle} testID="page-list-title">
            {I18n.get('wiki-pagelist-title')}
          </HeadingMText>
        )}
      </>
    ),
    [hasPages, imageSourceProps, wiki.description],
  );

  const listEmpty = React.useMemo(
    () => (
      <EmptyScreen
        svgImage="empty-wiki-summary"
        title={I18n.get('wiki-empty-summary-title')}
        text={I18n.get('wiki-empty-summary-text')}
        customStyle={styles.emptyPage}
        imageHeight={getScaleImageSize(UI_SIZES.elements.image.small)}
      />
    ),
    [],
  );

  const onPressItem = React.useCallback<NonNullable<WikiPageListProps['onPressItem']>>(
    pageId => navigation.navigate('wiki/reader', { pageId, resourceId: wiki.assetId }),
    [navigation, wiki.assetId],
  );

  return (
    <WikiPageList
      refreshControl={refreshControl}
      wikiData={wiki}
      ListComponent={FlatList}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      onPressItem={onPressItem}
    />
  );
}

const WikiSummaryScreen = withSession<Readonly<StaticScreenProps<WikiSummaryScreenParams>>>(function ({
  route: {
    params: { resourceId },
  },
  session,
}) {
  const navigation = useNavigation();
  const wikiData = useSelector(selectWiki(resourceId));
  const dispatch = useDispatch<WikiDispatch>();

  // The name of the wiki, once loaded, replaces the empty title of the options (CONVENTIONS « UI »)
  const wikiName = wikiData?.name;
  React.useLayoutEffect(() => {
    if (wikiName !== undefined) navigation.setOptions({ headerTitle: undefined, title: wikiName });
  }, [navigation, wikiName]);

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(async () => {
    await dispatch(loadWiki(session, resourceId));
  }, [dispatch, resourceId, session]);

  const renderLoading: ContentLoaderProps['renderLoading'] = React.useCallback(
    () => (
      <>
        <WikiResourceHeaderLoader />
        <View style={styles.listContainerPlaceholder}>
          <Placeholder>
            <PlaceholderLine
              noMargin
              height={TITLE_PLACEHOLDER_HEIGHT}
              style={styles.titlePlaceholder}
              testID="page-list-title-loader"
            />
            <View style={styles.listContentPlaceholder} testID="page-list-content-loader">
              <PlaceholderLine noMargin height={LINE_PLACEHOLDER_HEIGHT} style={styles.linePlaceholder} />
              <PlaceholderLine noMargin height={LINE_PLACEHOLDER_HEIGHT} style={styles.linePlaceholder} />
            </View>
          </Placeholder>
        </View>
      </>
    ),
    [],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return wikiData ? <WikiSummaryScreenLoaded wiki={wikiData} refreshControl={refreshControl} /> : <EmptyContentScreen />;
    },
    [wikiData],
  );

  return (
    <View style={styles.page}>
      <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />
    </View>
  );
});
WikiSummaryScreen.displayName = 'WikiSummaryScreen';

export default defineScreen({
  options: () => ({
    headerShadowVisible: false,
    // The name of the wiki is set by the screen: hidden until then (`title: ''` would show the name of the route)
    headerTitle: () => '',
    title: '',
  }),
  screen: WikiSummaryScreen,
});
