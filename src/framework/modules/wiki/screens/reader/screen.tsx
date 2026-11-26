import * as React from 'react';
import { View } from 'react-native';

import type { StaticScreenProps } from '@react-navigation/native';
import { FlashListProps } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { defineScreen, StackNavigation, useNavigation } from '~/app/navigation-new';
import { SingleAvatar } from '~/framework/components/avatar';
import { AvatarSizes } from '~/framework/components/avatar/styles';
import GhostButton from '~/framework/components/buttons/ghost';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text/viewer';
import { RichEditorViewerProps } from '~/framework/components/inputs/rich-text/viewer/types';
import { BodyBoldText, HeadingMText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { ResourceWithCommentsTemplate } from '~/framework/modules/comments';
import { CommentsTreeProps } from '~/framework/modules/comments/components/comments-tree';
import {
  deleteWikiPageComment,
  editWikiPageComment,
  loadWiki,
  loadWikiPage,
  postWikiPageComment,
} from '~/framework/modules/wiki/actions';
import WikiPageHeader from '~/framework/modules/wiki/components/page-header';
import { WikiPageHeaderPlaceholder } from '~/framework/modules/wiki/components/page-header/component';
import { HeaderStatus } from '~/framework/modules/wiki/components/page-header/types';
import WikiSelectButton from '~/framework/modules/wiki/components/select-button';
import { Wiki, WikiPage, WikiPageMetaData } from '~/framework/modules/wiki/model';
import { canCommentWiki } from '~/framework/modules/wiki/model/business';
import { getAdjacentPageIds } from '~/framework/modules/wiki/model/pages';
import { selectPage, selectWiki, WikiDispatch } from '~/framework/modules/wiki/store';
import { useAudience } from '~/modules/audience/hooks';
import type { AudienceReferer } from '~/modules/audience/model';
import { withSession } from '~/modules/auth/hoc';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { I18n } from '~/util/i18n';

import styles from './styles';

type WikiReaderScreenParams = {
  resourceId: Wiki['assetId'];
  pageId: WikiPageMetaData['id'];
  reverseAnimation?: boolean;
};

const wikiAudienceConfig: Pick<AudienceReferer, 'module' | 'resourceType'> = { module: 'wiki', resourceType: 'page' };

/**
 * PLACEHOLDERS
 */

const WikiReaderPageSelectPlaceholder = () => (
  <Placeholder>
    <View style={styles.selectButtonWrapper} testID="page-select-button-loader" />
  </Placeholder>
);

const WikiReaderHeaderPlaceholder = () => (
  <Placeholder>
    <WikiPageHeaderPlaceholder>
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
    </WikiPageHeaderPlaceholder>
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
  const navigation = useNavigation();
  // The list of the pages gives back the page chosen (nothing if the user closes it): shown in place of this one
  const openPages = React.useCallback(async () => {
    const pageId = await navigation.navigateAsync('wiki/pages', { currentPageId: page.id, resourceId: wiki.assetId });
    if (pageId) onGoToPage(pageId);
  }, [navigation, onGoToPage, page.id, wiki.assetId]);

  return (
    <>
      <WikiSelectButton
        text={I18n.get('wiki-select-page-button')}
        action={openPages}
        iconLeft="ui-text-page"
        iconRight="ui-unfold"
        wrapperStyle={styles.selectButtonWrapper}
        testID="page-select-button"
      />
      <WikiPageHeader status={page.isVisible ? HeaderStatus.VISIBLE : HeaderStatus.HIDDEN}>
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
      </WikiPageHeader>
      {children}
    </>
  );
};

const WikiReaderContent = ({
  onGoToPage,
  onLoad,
  page,
  wiki,
}: Pick<RichEditorViewerProps, 'onLoad'> & {
  onGoToPage: (id: WikiPage['id'], reverse?: boolean) => void;
  page: WikiPage;
  wiki: Wiki;
}) => {
  const { nextId: nextPageId, previousId: prevPageId } = React.useMemo(
    () => getAdjacentPageIds(wiki.pages, page.id),
    [page.id, wiki.pages],
  );
  const goToPreviousPage = React.useCallback(() => onGoToPage(prevPageId!, true), [onGoToPage, prevPageId]);
  const goToNextPage = React.useCallback(() => onGoToPage(nextPageId!), [onGoToPage, nextPageId]);

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
          action={goToPreviousPage}
        />
        <GhostButton
          style={styles.bottomNavigationRight}
          outline
          iconRight="ui-arrowRight"
          disabled={!nextPageId}
          testID="next-page-button"
          text={I18n.get('wiki-page-next')}
          action={goToNextPage}
        />
      </View>
    </WikiPageNavigationWrapper>
  );
};

export function WikiReaderScreenLoaded({
  page,
  refreshControl,
  session,
  wiki,
}: {
  page: WikiPage;
  refreshControl: FlashListProps<any>['refreshControl'];
  session: AuthActiveAccount;
  wiki: Wiki;
}) {
  // A native stack navigation: changing of page replaces the screen (`replace`)
  const navigation = useNavigation<StackNavigation>();
  const resourceId = wiki.assetId;

  const switchToPage = React.useCallback(
    (id: WikiPage['id'], reverse?: boolean) => {
      navigation.replace('wiki/reader', { pageId: id, resourceId, reverseAnimation: reverse });
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
  const dispatch = useDispatch<WikiDispatch>();

  const [autoScrollItem, setAutoScrollItem] = React.useState<ArrayElement<CommentsTreeProps['data']>['id'] | undefined>(undefined);

  const canAddComment = canCommentWiki(wiki.rights);
  const onSubmit = React.useCallback<NonNullable<CommentsTreeProps['onSubmit']>>(
    async (data, replyTo) => {
      const newCommentId = await dispatch(postWikiPageComment(session, wiki.assetId, page.id, data.content, replyTo));
      setAutoScrollItem(newCommentId);
    },
    [dispatch, page.id, session, wiki.assetId],
  );

  const onEdit = React.useCallback<NonNullable<CommentsTreeProps['onEdit']>>(
    async (data, id) => {
      await dispatch(editWikiPageComment(session, wiki.assetId, page.id, id, data.content));
    },
    [dispatch, page.id, session, wiki.assetId],
  );

  const onDelete = React.useCallback<NonNullable<CommentsTreeProps['onDelete']>>(
    async id => {
      await dispatch(deleteWikiPageComment(session, wiki.assetId, page.id, id));
    },
    [dispatch, page.id, session, wiki.assetId],
  );

  return (
    <>
      <ResourceWithCommentsTemplate
        canAddComment={canAddComment}
        canAddReply
        data={page.comments}
        onSubmit={onSubmit}
        onEdit={onEdit}
        onDelete={onDelete}
        focusItem={autoScrollItem}
        refreshControl={refreshControl}
        ListHeaderComponent={<WikiReaderContent onGoToPage={switchToPage} page={page} wiki={wiki} onLoad={onLoad} />}
      />
      {!loaded && <View style={styles.webViewPlaceholder}>{renderPlaceholder()}</View>}
    </>
  );
}

const WikiReaderScreen = withSession<StaticScreenProps<WikiReaderScreenParams>>(function ({
  route: {
    params: { pageId, resourceId },
  },
  session,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch<WikiDispatch>();
  const wiki = useSelector(selectWiki(resourceId));
  const page = useSelector(selectPage(pageId));

  // The title of the page, once loaded, replaces the empty one of the options (CONVENTIONS « UI »)
  const pageTitle = page?.title;
  React.useLayoutEffect(() => {
    if (pageTitle !== undefined) navigation.setOptions({ headerTitle: undefined, title: pageTitle });
  }, [navigation, pageTitle]);

  const { markView } = useAudience({ ...wikiAudienceConfig, resourceId: pageId });

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(async () => {
    await dispatch(loadWiki(session, resourceId));
    await dispatch(loadWikiPage(session, resourceId, pageId));
    markView();
  }, [dispatch, session, resourceId, pageId, markView]);

  const renderContent = React.useCallback<NonNullable<ContentLoaderProps['renderContent']>>(
    refreshControl =>
      wiki && page ? (
        <WikiReaderScreenLoaded wiki={wiki} page={page} refreshControl={refreshControl} session={session} />
      ) : (
        <EmptyContentScreen />
      ),
    [page, session, wiki],
  );

  return <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={WikiReaderScreenPlaceholder} />;
});
WikiReaderScreen.displayName = 'WikiReaderScreen';

export default defineScreen({
  options: ({ route }) => ({
    animationTypeForReplace: route.params.reverseAnimation ? 'pop' : 'push',
    // The title of the page is set by the screen: hidden until then (`title: ''` would show the name of the route)
    headerTitle: () => '',
    title: '',
  }),
  screen: WikiReaderScreen,
});
