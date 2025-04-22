import * as React from 'react';
import { LayoutChangeEvent, ScrollView, ScrollViewProps, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import type { WikiReaderScreen } from './types';

import { I18n } from '~/app/i18n';
import { getStore, IGlobalState } from '~/app/store';
import { SingleAvatar } from '~/framework/components/avatar';
import { AvatarSizes } from '~/framework/components/avatar/styles';
import GhostButton from '~/framework/components/buttons/ghost';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text/viewer';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { BodyBoldText, HeadingMText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import PageHeader from '~/framework/modules/wiki/components/page-header';
import { PageHeaderPlaceholder } from '~/framework/modules/wiki/components/page-header/component';
import { HeaderStatus } from '~/framework/modules/wiki/components/page-header/types';
import PageListBottomSheet from '~/framework/modules/wiki/components/page-list/page-list-bottom-sheet';
import SelectButton from '~/framework/modules/wiki/components/select-button';
import { Wiki, WikiPage } from '~/framework/modules/wiki/model';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import service from '~/framework/modules/wiki/service';
import { actions, selectors, WikiAction, WikiPageAction } from '~/framework/modules/wiki/store';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WikiNavigationParams, typeof wikiRouteNames.reader>): NativeStackNavigationOptions => {
  const wikiPageData = selectors.page(route.params.pageId)(getStore().getState());
  return {
    ...navBarOptions({
      navigation,
      route,
      title: wikiPageData?.title ?? '',
    }),
    animationTypeForReplace: route.params.reverseAnimation ? 'pop' : 'push',
  };
};

const PageHeaderLoader = () => (
  <View>
    <View style={styles.topNavigation} />
    <Placeholder>
      <PageHeaderPlaceholder>
        <PlaceholderLine noMargin height={TextSizeStyle.Bigger.lineHeight} style={styles.headerPlaceholderTitle} />
        <View style={styles.headerAuthorInfo}>
          <PlaceholderMedia isRound size={AvatarSizes.md} style={styles.headerPlaceholderAvatar} />
          <View style={styles.headerAuthorInfoText}>
            <PlaceholderLine
              width={70}
              noMargin
              height={TextSizeStyle.Medium.lineHeight - 4}
              style={styles.headerPlaceholderInfo}
            />
            <PlaceholderLine
              width={40}
              noMargin
              height={TextSizeStyle.Normal.lineHeight - 4}
              style={styles.headerPlaceholderInfo}
            />
          </View>
        </View>
      </PageHeaderPlaceholder>
    </Placeholder>
  </View>
);

export function WikiReaderScreenLoaded({
  onGoToPage,
  page,
  refreshControl,
  renderLoading,
  wiki,
}: {
  page: WikiPage;
  wiki: Wiki;
  refreshControl: ScrollViewProps['refreshControl'];
  onGoToPage: (id: WikiPage['id'], reverse?: boolean) => void;
  renderLoading: ContentLoaderProps['renderLoading'];
}) {
  const [webViewReady, setWebViewReady] = React.useState(false);

  const pageIndex = React.useMemo(() => wiki.pages.findIndex(p => p.id === page.id), [page, wiki.pages]);
  const prevPageId = React.useMemo(() => (pageIndex > 0 ? wiki.pages.at(pageIndex - 1)?.id : undefined), [pageIndex, wiki.pages]);
  const nextPageId = React.useMemo(
    () => (pageIndex !== -1 ? wiki.pages.at(pageIndex + 1)?.id : undefined),
    [pageIndex, wiki.pages],
  );
  const pageListBottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const openPagesBottomSheet = React.useCallback(() => {
    pageListBottomSheetRef.current?.present();
  }, []);

  const [buttonHeight, setButtonHeight] = React.useState<number | null>(null);

  const onSelectButtonLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setButtonHeight(height);
  }, []);

  const selectButtonWrapperHeight = React.useMemo(() => {
    if (buttonHeight) return buttonHeight + styles.selectButtonWrapper.marginVertical * 2;
  }, [buttonHeight]);

  return (
    <>
      <ScrollView refreshControl={refreshControl} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topNavigation} />
        <SelectButton
          text={I18n.get('wiki-select-page-button')}
          action={openPagesBottomSheet}
          iconLeft="ui-textPage"
          iconRight="ui-unfold"
          wrapperStyle={styles.selectButtonWrapper}
          onLayout={onSelectButtonLayout}
        />
        <PageHeader status={page.isVisible ? HeaderStatus.VISIBLE : HeaderStatus.HIDDEN}>
          <HeadingMText>{page.title}</HeadingMText>
          <View style={styles.headerAuthorInfo}>
            <SingleAvatar userId={page.creatorId} size="md" />
            <View style={styles.headerAuthorInfoText}>
              <BodyBoldText numberOfLines={1}>{page.creatorName}</BodyBoldText>
              <SmallText numberOfLines={1}>
                {I18n.get('wiki-page-published-at', { date: I18n.date(page.updatedAt ?? page.createdAt) })}
              </SmallText>
            </View>
          </View>
        </PageHeader>
        <View style={styles.content}>
          <RichEditorViewer content={page.content} onLoad={() => setWebViewReady(true)} />
        </View>
        <View style={styles.bottomNavigation}>
          <GhostButton
            outline
            iconLeft="ui-arrowLeft"
            disabled={!prevPageId}
            text={I18n.get('wiki-page-previous')}
            action={() => {
              onGoToPage(prevPageId!, true);
            }}
          />
          <GhostButton
            style={styles.bottomNavigationRight}
            outline
            iconRight="ui-arrowRight"
            disabled={!nextPageId}
            text={I18n.get('wiki-page-next')}
            action={() => {
              onGoToPage(nextPageId!);
            }}
          />
        </View>
      </ScrollView>
      {!webViewReady && <View style={styles.webViewPlaceholder}>{renderLoading?.()}</View>}
      <PageListBottomSheet
        currentPageId={page.id}
        ListComponent={FlatList}
        onPress={onGoToPage}
        ref={pageListBottomSheetRef}
        additionalTopInset={selectButtonWrapperHeight}
        wikiData={wiki} /* Create page button for next version
      ListFooterComponent={
        <>
          <View style={styles.separatorSpacing}>
            <Separator marginVertical={UI_SIZES.spacing.medium} />
          </View>
          <TertiaryButton style={styles.bottomSheetNewPageButton} iconLeft="ui-plus" text={I18n.get('wiki-pagelist-newpage')} />
        </>
      } */
      />
    </>
  );
}

export default function WikiReaderScreen({
  navigation,
  route: {
    params: { pageId, resourceId },
  },
}: WikiReaderScreen.AllProps) {
  const wikiData = useSelector(selectors.wiki(resourceId));
  const pageData = useSelector(selectors.page(pageId));
  const dispatch = useDispatch<ThunkDispatch<IGlobalState, any, WikiAction | WikiPageAction>>();

  const switchToPage = React.useCallback(
    (id: WikiPage['id'], reverse?: boolean) => {
      navigation.replace(wikiRouteNames.reader, { pageId: id, resourceId, reverseAnimation: reverse });
    },
    [navigation, resourceId],
  );

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(async () => {
    const newWikiData = await service.wiki.get({ id: resourceId });
    const newPageData = await service.page.get({ id: resourceId, pageId: pageId });
    dispatch(actions.loadWiki(newWikiData));
    dispatch(actions.loadPage(resourceId, newPageData));
    navigation.setOptions({ title: newPageData.title });
  }, [resourceId, pageId, dispatch, navigation]);

  const renderLoading = React.useCallback(
    () => (
      <View style={styles.loader}>
        <Placeholder>
          <View style={styles.selectButtonWrapper}>{/* <PlaceholderLine noMargin height={BUTTON_PLACEHOLDER_HEIGHT} /> */}</View>
        </Placeholder>
        <PageHeaderLoader />
        <View style={styles.content}>
          <Placeholder>
            <View style={styles.contentLoader}>
              <PlaceholderLine noMargin height={TextSizeStyle.Big.lineHeight} />
              <PlaceholderLine noMargin height={TextSizeStyle.Big.lineHeight} />
              <PlaceholderLine noMargin height={TextSizeStyle.Big.lineHeight} width={70} />
            </View>
          </Placeholder>
        </View>
      </View>
    ),
    [],
  );

  // const togglePageVisibility = React.useCallback(() => {
  //   setIsPageVisible(prevState => (prevState === HeaderStatus.VISIBLE ? HeaderStatus.HIDDEN : HeaderStatus.VISIBLE));
  // }, []);

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return wikiData && pageData ? (
        <WikiReaderScreenLoaded
          refreshControl={refreshControl}
          wiki={wikiData}
          page={pageData}
          renderLoading={renderLoading}
          onGoToPage={switchToPage}
        />
      ) : (
        <EmptyContentScreen />
      );
    },
    [pageData, renderLoading, switchToPage, wikiData],
  );

  return (
    <PageView style={styles.page}>
      <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />
    </PageView>
  );
}
