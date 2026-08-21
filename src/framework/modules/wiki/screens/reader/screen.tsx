import * as React from 'react';
import { LayoutChangeEvent, View } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { I18n } from '~/app/i18n';
import { getStore, IGlobalState } from '~/app/store';
import { SingleAvatar } from '~/framework/components/avatar';
import { AvatarSizes } from '~/framework/components/avatar/styles';
import GhostButton from '~/framework/components/buttons/ghost';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text/viewer';
import { RichEditorViewerProps } from '~/framework/components/inputs/rich-text/viewer/types';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import SocialResourceViewer from '~/framework/components/pages/social-resource-viewer';
import {
  ITEM_COMMENT,
  ITEM_RESPONSE,
  type SocialResourceViewer as SocialResourceViewerTypes,
} from '~/framework/components/pages/social-resource-viewer/types';
import { BodyBoldText, HeadingMText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { useAudience } from '~/framework/modules/audience';
import { AccountType } from '~/framework/modules/auth/model';
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

import styles from './styles';
import type { WikiReaderScreen } from './types';
import { wikiAudienceConfig } from '../../module-config';

const DEBUG_LIST_DATA: SocialResourceViewerTypes.Props['comments'] = [];
for (let i = 1; i <= 20; ++i) {
  DEBUG_LIST_DATA.push({
    authorAccountType: AccountType.Personnel,
    authorId: '',
    authorName: i % 2 === 0 ? 'Myster Mask le détective canard' : 'Petit Prince',
    date: Temporal.Now.instant().subtract({ hours: (i - 1) * 8 }),
    hasResponses: i % 3 !== 0,
    id: i.toString(),
    type: ITEM_COMMENT,
    value: i.toString(),
  });
  for (let j = 1; j <= i % 3; ++j) {
    DEBUG_LIST_DATA.push({
      authorAccountType: AccountType.Relative,
      authorId: '',
      authorName: i % 2 === 0 ? 'Super connard' : 'Uvuvwevwevwe Onyetenyevwe Ugwemuhwem Osas',
      date: Temporal.Now.instant()
        .subtract({ hours: (i - 1) * 8 })
        .subtract({ minutes: (i - 1) * 12 }),
      hasResponses: j !== i % 3,
      id: i.toString() + '-' + j.toString(),
      inReplyTo: i.toString(),
      type: ITEM_RESPONSE,
      value: i.toString() + '-' + j.toString(),
    });
  }
}

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WikiNavigationParams, typeof wikiRouteNames.reader>): NativeStackNavigationOptions => {
  const wikiPageData = selectors.page(route.params.pageId)(getStore().getState());
  return {
    ...navBarOptions({
      backButtonTestID: 'page-back-button',
      navigation,
      route,
      title: wikiPageData?.title ?? '',
    }),
    animationTypeForReplace: route.params.reverseAnimation ? 'pop' : 'push',
  };
};

/**
 * PLACEHOLDERS
 */

const WikiReaderPageSelectPlaceholder = () => (
  <Placeholder>
    <View style={styles.selectButtonWrapper} testID="page-select-button-loader">
      {/* <PlaceholderLine noMargin height={BUTTON_PLACEHOLDER_HEIGHT} /> */}
    </View>
  </Placeholder>
);

const WikiReaderHeaderPlaceholder = () => (
  <Placeholder>
    <PageHeaderPlaceholder>
      <PlaceholderLine
        noMargin
        height={TextSizeStyle.Bigger.lineHeight}
        style={styles.headerPlaceholderTitle}
        testID="page-title-loader"
      />
      <View style={styles.headerAuthorInfo}>
        <PlaceholderMedia isRound size={AvatarSizes.sm} style={styles.headerPlaceholderAvatar} testID="page-author-avatar-loader" />
        <View style={styles.headerAuthorInfoText} testID="page-author-info-loader">
          <PlaceholderLine width={70} noMargin height={TextSizeStyle.Medium.lineHeight - 4} style={styles.headerPlaceholderInfo} />
          <PlaceholderLine width={40} noMargin height={TextSizeStyle.Normal.lineHeight - 4} style={styles.headerPlaceholderInfo} />
        </View>
      </View>
    </PageHeaderPlaceholder>
  </Placeholder>
);

const WikiReaderContentPlaceholder = () => (
  <View style={styles.content}>
    <Placeholder>
      <View style={styles.contentLoader} testID="page-content-loader">
        <PlaceholderLine noMargin height={TextSizeStyle.Big.lineHeight} />
        <PlaceholderLine noMargin height={TextSizeStyle.Big.lineHeight} />
        <PlaceholderLine noMargin height={TextSizeStyle.Big.lineHeight} width={70} />
      </View>
    </Placeholder>
  </View>
);
const WikiReaderScreenPlaceholder = () => (
  <View style={styles.loader}>
    <WikiReaderPageSelectPlaceholder />
    <WikiReaderHeaderPlaceholder />
    <WikiReaderContentPlaceholder />
  </View>
);

const WikiReaderPlaceholderWithData = () => (
  <View style={styles.loader}>
    <WikiReaderContentPlaceholder />
  </View>
);

const WikiPageNavigationWrapper = ({
  children,
  onGoToPage,
  page,
  wiki,
}: React.PropsWithChildren<{ page: WikiPage; wiki: Wiki; onGoToPage: (id: WikiPage['id'], reverse?: boolean) => void }>) => {
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
      <SelectButton
        text={I18n.get('wiki-select-page-button')}
        action={openPagesBottomSheet}
        iconLeft="ui-text-page"
        iconRight="ui-unfold"
        wrapperStyle={styles.selectButtonWrapper}
        testID="page-select-button"
        onLayout={onSelectButtonLayout}
      />
      <PageHeader status={page.isVisible ? HeaderStatus.VISIBLE : HeaderStatus.HIDDEN}>
        <HeadingMText testID="page-title">{page.title}</HeadingMText>
        <View style={styles.headerAuthorInfo}>
          <SingleAvatar userId={page.updaterId ?? page.creatorId} size="sm" testID="page-author-avatar" border />
          <View style={styles.headerAuthorInfoText}>
            <BodyBoldText numberOfLines={1} testID="page-author-name">
              {page.updaterName ?? page.creatorName}
            </BodyBoldText>
            <SmallText numberOfLines={1} testID="page-date">
              {I18n.get('wiki-page-published-at', { date: I18n.date(page.updatedAt ?? page.createdAt) })}
            </SmallText>
          </View>
        </View>
      </PageHeader>
      {children}
      <PageListBottomSheet
        currentPageId={page.id}
        ListComponent={FlatList}
        onPress={onGoToPage}
        ref={pageListBottomSheetRef}
        additionalTopInset={selectButtonWrapperHeight}
        wikiData={wiki}
      />
    </>
  );
};

const WikiReaderContent = ({
  onGoToPage,
  onLoad,
  pageId,
  resourceId,
}: Pick<WikiReaderScreen.NavParams, 'pageId' | 'resourceId'> &
  Pick<RichEditorViewerProps, 'onLoad'> & { onGoToPage: (id: WikiPage['id'], reverse?: boolean) => void }) => {
  const wiki = useSelector(selectors.wiki(resourceId))!;
  const page = useSelector(selectors.page(pageId));

  const pageIndex = React.useMemo(() => wiki.pages.findIndex(p => p.id === page.id), [page, wiki.pages]);
  const prevPageId = React.useMemo(() => (pageIndex > 0 ? wiki.pages.at(pageIndex - 1)?.id : undefined), [pageIndex, wiki.pages]);
  const nextPageId = React.useMemo(
    () => (pageIndex !== -1 ? wiki.pages.at(pageIndex + 1)?.id : undefined),
    [pageIndex, wiki.pages],
  );

  return (
    <WikiPageNavigationWrapper wiki={wiki} page={page} onGoToPage={onGoToPage}>
      <View style={styles.content} testID="page-content">
        <RichEditorViewer content={page.content} onLoad={onLoad} />
      </View>
      <View style={styles.bottomNavigation}>
        <GhostButton
          outline
          iconLeft="ui-arrowLeft"
          disabled={!prevPageId}
          testID="previous-page-button"
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
          testID="next-page-button"
          text={I18n.get('wiki-page-next')}
          action={() => {
            onGoToPage(nextPageId!);
          }}
        />
      </View>
    </WikiPageNavigationWrapper>
  );
};

export function WikiReaderScreenLoaded({
  navigation,
  route: {
    params: { pageId, resourceId },
  },
}: WikiReaderScreen.AllProps) {
  const wiki = useSelector(selectors.wiki(resourceId));
  const page = useSelector(selectors.page(pageId));

  const switchToPage = React.useCallback(
    (id: WikiPage['id'], reverse?: boolean) => {
      navigation.replace(wikiRouteNames.reader, { pageId: id, resourceId, reverseAnimation: reverse });
    },
    [navigation, resourceId],
  );
  const [loaded, setLoaded] = React.useState(false);
  const onLoad = React.useCallback(() => {
    setLoaded(true);
  }, []);
  const renderPlaceholder = React.useCallback(
    () => (
      <WikiPageNavigationWrapper onGoToPage={switchToPage} page={page} wiki={wiki}>
        <WikiReaderPlaceholderWithData />
      </WikiPageNavigationWrapper>
    ),
    [page, switchToPage, wiki],
  );
  return (
    <>
      <SocialResourceViewer
        navigation={navigation}
        canAddComment={true} // ToDo: use resource rights here
        data={page.comments}>
        <WikiReaderContent onGoToPage={switchToPage} pageId={pageId} resourceId={resourceId} onLoad={onLoad} />
      </SocialResourceViewer>
      {!loaded && <View style={styles.webViewPlaceholder}>{renderPlaceholder()}</View>}
    </>
  );
}

export default function WikiReaderScreen({
  navigation,
  route,
  route: {
    params: { pageId, resourceId },
  },
  ...props
}: WikiReaderScreen.AllProps) {
  const dispatch = useDispatch<ThunkDispatch<IGlobalState, any, WikiAction | WikiPageAction>>();

  const { markView } = useAudience({ ...wikiAudienceConfig, resourceId: pageId });

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(async () => {
    const newWikiData = await service.wiki.get({ id: resourceId });
    const newPageData = await service.page.get({ id: resourceId, pageId: pageId });
    dispatch(actions.loadWiki(newWikiData));
    dispatch(actions.loadPage(resourceId, newPageData));
    navigation.setOptions({ title: newPageData.title });
    markView();
  }, [resourceId, pageId, dispatch, navigation, markView]);

  const renderContent = React.useCallback(
    () => <WikiReaderScreenLoaded navigation={navigation} route={route} {...props} />,
    [navigation, props, route],
  );

  return <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={WikiReaderScreenPlaceholder} />;
}
