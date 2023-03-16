import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, RefreshControl, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchZimbraMailAction, fetchZimbraQuotaAction, fetchZimbraRootFoldersAction } from '~/framework/modules/zimbra/actions';
import { downloadAttachmentAction } from '~/framework/modules/zimbra/actions/download';
import { FooterButton, HeaderMail, HeaderMailDetails, RenderPJs } from '~/framework/modules/zimbra/components/MailContentItems';
import MoveMailsModal from '~/framework/modules/zimbra/components/modals/MoveMailsModal';
import { DraftType } from '~/framework/modules/zimbra/model';
import moduleConfig from '~/framework/modules/zimbra/module-config';
import { ZimbraNavigationParams, zimbraRouteNames } from '~/framework/modules/zimbra/navigation';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { NavBarAction, navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { HtmlContentView } from '~/ui/HtmlContentView';

import styles from './styles';
import { ZimbraMailScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ZimbraNavigationParams, typeof zimbraRouteNames.mail>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: route.params.subject,
});

const ZimbraMailScreen = (props: ZimbraMailScreenPrivateProps) => {
  const [areDetailsVisible, setDetailsVisible] = React.useState<boolean>(false);
  const moveModalRef = React.useRef<ModalBoxHandle>(null);
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchContent = async () => {
    try {
      const { rootFolders } = props;
      const { id } = props.route.params;

      await props.fetchMail(id);
      await props.fetchQuota();
      if (!rootFolders.length) await props.fetchRootFolders();
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchContent()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchContent()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const fetchOnNavigation = () => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchOnNavigation();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const markAsUnread = async () => {
    try {
      const { navigation, session } = props;
      const { id } = props.route.params;

      if (!session) throw new Error();
      await zimbraService.mails.toggleUnread(session, [id], true);
      navigation.goBack();
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const trashMail = async () => {
    try {
      const { navigation, session } = props;
      const { id } = props.route.params;

      if (!session) throw new Error();
      await zimbraService.mails.trash(session, [id]);
      navigation.goBack();
      Toast.show(I18n.t('zimbra-message-deleted'), { ...UI_ANIMATIONS.toast });
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const deleteMail = async () => {
    try {
      const { navigation, session } = props;
      const { id } = props.route.params;

      if (!session) throw new Error();
      await zimbraService.mails.delete(session, [id]);
      navigation.goBack();
      Toast.show(I18n.t('zimbra-message-deleted'), { ...UI_ANIMATIONS.toast });
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const alertPermanentDeletion = () => {
    Alert.alert(I18n.t('zimbra-message-deleted-confirm'), I18n.t('zimbra-message-deleted-confirm-text'), [
      {
        text: I18n.t('common.cancel'),
        style: 'default',
      },
      {
        text: I18n.t('common.delete'),
        onPress: deleteMail,
        style: 'destructive',
      },
    ]);
  };

  const moveMailCallback = () => {
    const { navigation } = props;

    moveModalRef.current?.doDismissModal();
    navigation.goBack();
  };

  const openComposer = (type: DraftType) => {
    const { navigation, quota } = props;
    const { id } = props.route.params;

    if (quota.quota > 0 && quota.storage >= quota.quota) {
      return Alert.alert(I18n.t('zimbra-quota-overflowTitle'), I18n.t('zimbra-quota-overflowText'));
    }
    navigation.navigate(zimbraRouteNames.composer, {
      type,
      mailId: id,
    });
  };

  const getMenuActions = () => {
    const { folderPath } = props.route.params;

    return [
      ...(folderPath.startsWith('/Inbox') || folderPath === '/Junk'
        ? [
            {
              title: I18n.t('zimbra-mark-unread'),
              action: markAsUnread,
              icon: {
                ios: 'eye.slash',
                android: 'ic_visibility_off',
              },
            },
            {
              title: I18n.t('zimbra-move'),
              action: () => moveModalRef.current?.doShowModal(),
              icon: {
                ios: 'arrow.up.square',
                android: 'ic_move_to_inbox',
              },
            },
          ]
        : []),
      ...(folderPath === '/Trash'
        ? [
            {
              title: I18n.t('zimbra-restore'),
              action: () => moveModalRef.current?.doShowModal(),
              icon: {
                ios: 'arrow.uturn.backward.circle',
                android: 'ic_restore',
              },
            },
          ]
        : []),
      deleteAction({ action: folderPath === '/Trash' ? alertPermanentDeletion : trashMail }),
    ];
  };

  React.useEffect(() => {
    const { mail, navigation } = props;

    if (loadingState !== AsyncPagedLoadingState.DONE || !mail) return;
    const actions = getMenuActions();
    navigation.setOptions({
      title: mail.subject,
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <PopupMenu actions={actions}>
          <NavBarAction iconName="ui-options" />
        </PopupMenu>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState]);

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderFooter = () => {
    const { folderPath } = props.route.params;

    return folderPath !== '/Trash' ? (
      <View style={styles.containerFooter}>
        <FooterButton icon="reply" text={I18n.t('zimbra-reply')} onPress={() => openComposer(DraftType.REPLY)} />
        <FooterButton icon="reply_all" text={I18n.t('zimbra-replyAll')} onPress={() => openComposer(DraftType.REPLY_ALL)} />
        <FooterButton icon="forward" text={I18n.t('zimbra-forward')} onPress={() => openComposer(DraftType.FORWARD)} />
      </View>
    ) : null;
  };

  const renderMail = () => {
    const { mail } = props;

    return mail ? (
      <View style={styles.fullContainer}>
        <HeaderMail mailInfos={mail} setDetailsVisibility={value => setDetailsVisible(value)} />
        {areDetailsVisible ? <HeaderMailDetails mailInfos={mail} setDetailsVisibility={value => setDetailsVisible(value)} /> : null}
        {mail.hasAttachment && (
          <RenderPJs
            attachments={mail.attachments}
            mailId={mail.id}
            onDownload={props.downloadAttachment}
            dispatch={props.dispatch}
          />
        )}
        <View style={styles.shadowContainer}>
          <View style={styles.marginView} />
          <View style={styles.scrollContainer}>
            <ScrollView style={styles.scrollAlign} contentContainerStyle={styles.scrollContent}>
              {mail.body ? (
                <HtmlContentView
                  html={mail.body}
                  opts={{ selectable: true }}
                  onHtmlError={() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED)}
                />
              ) : null}
            </ScrollView>
          </View>
        </View>
        {renderFooter()}
        <MoveMailsModal
          ref={moveModalRef}
          folderPath={props.route.params.folderPath}
          folders={props.rootFolders}
          mailIds={[mail.id]}
          session={props.session}
          successCallback={moveMailCallback}
        />
      </View>
    ) : (
      renderError()
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
        return renderMail();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return <PageView>{renderPage()}</PageView>;
};

export default connect(
  (state: IGlobalState) => {
    const zimbraState = moduleConfig.getState(state);
    const session = getSession(state);

    return {
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      mail: zimbraState.mail.data,
      quota: zimbraState.quota.data,
      rootFolders: zimbraState.rootFolders.data,
      session,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        downloadAttachment: downloadAttachmentAction,
        fetchMail: tryAction(fetchZimbraMailAction, undefined, true) as unknown as ZimbraMailScreenPrivateProps['fetchMail'],
        fetchQuota: tryAction(fetchZimbraQuotaAction, undefined, true) as unknown as ZimbraMailScreenPrivateProps['fetchQuota'],
        fetchRootFolders: tryAction(
          fetchZimbraRootFoldersAction,
          undefined,
          true,
        ) as unknown as ZimbraMailScreenPrivateProps['fetchRootFolders'],
      },
      dispatch,
    ),
)(ZimbraMailScreen);