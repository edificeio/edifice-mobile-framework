import I18n from 'i18n-js';
import * as React from 'react';
import { RefreshControl, View } from 'react-native';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { HeaderTitleAndSubtitle } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { fetchFormDistributionsAction, fetchFormsReceivedAction } from '~/modules/form/actions';
import { FormDistributionCard } from '~/modules/form/components/FormDistributionCard';
import { FormDistributionListModal } from '~/modules/form/components/FormDistributionListModal';
import moduleConfig from '~/modules/form/moduleConfig';
import { DistributionStatus, IDistribution, IForm } from '~/modules/form/reducer';

// TYPES ==========================================================================================

export type IFormDistributions = IForm & {
  distributions: IDistribution[];
};

interface IFormDistributionListScreen_DataProps {
  formDistributions: IFormDistributions[];
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}

interface IFormDistributionListScreen_EventProps {
  fetchDistributions: () => Promise<IDistribution[]>;
  fetchForms: () => Promise<IForm[]>;
  dispatch: ThunkDispatch<any, any, any>;
}

type IFormDistributionListScreen_Props = IFormDistributionListScreen_DataProps &
  IFormDistributionListScreen_EventProps &
  NavigationInjectedProps;

// COMPONENT ======================================================================================

const FormDistributionListScreen = (props: IFormDistributionListScreen_Props) => {
  const modalRef: { current: any } = React.createRef();
  const [modalDistributions, setModalDistributions] = React.useState<IFormDistributions | undefined>();

  // LOADER =======================================================================================

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchList = async () => {
    try {
      await props.fetchDistributions();
      await props.fetchForms();
    } catch (e) {
      throw e;
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchList()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchList()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refresh = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchList()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const refreshSilent = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
    fetchList()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const fetchOnNavigation = () => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    else refreshSilent();
  };

  const focusEventListener = React.useRef<NavigationEventSubscription>();
  React.useEffect(() => {
    focusEventListener.current = props.navigation.addListener('didFocus', () => {
      fetchOnNavigation();
    });
    return () => {
      focusEventListener.current?.remove();
    };
  }, []);

  // EVENTS =======================================================================================

  const onOpenDistribution = (id: number, status: DistributionStatus, form: IForm) => {
    modalRef?.current?.doDismissModal();
    props.navigation.navigate(`${moduleConfig.routeName}/distribution`, {
      id,
      status,
      formId: form.id,
      title: form.title,
      editable: form.editable,
    });
  };

  const onOpenItem = (item: IFormDistributions) => {
    const { distributions } = item;
    if (!item.multiple || !distributions.some(distribution => distribution.status === DistributionStatus.FINISHED)) {
      onOpenDistribution(distributions[0].id, distributions[0].status, item as IForm);
    } else {
      setModalDistributions(item);
      modalRef?.current?.doShowModal();
    }
  };

  // EMPTY SCREEN =================================================================================

  const renderEmpty = () => {
    return (
      <EmptyScreen
        svgImage="empty-form"
        title={I18n.t('form.formDistributionListScreen.emptyScreen.title')}
        text={I18n.t('form.formDistributionListScreen.emptyScreen.text')}
      />
    );
  };

  // ERROR ========================================================================================

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  // DISTRIBUTION LIST ============================================================================

  const renderDistributionList = () => {
    return (
      <>
        <FlatList
          data={props.formDistributions}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <FormDistributionCard formDistributions={item} onOpen={onOpenItem} />}
          refreshControl={
            <RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => refresh()} />
          }
          ListHeaderComponent={<View style={{ height: UI_SIZES.spacing.medium }} />}
          ListEmptyComponent={renderEmpty()}
        />
        <FormDistributionListModal
          modalBoxRef={modalRef}
          distributions={modalDistributions?.distributions}
          form={modalDistributions as IForm}
          openDistribution={onOpenDistribution}
        />
      </>
    );
  };

  // RENDER =======================================================================================

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
        return renderDistributionList();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return (
    <PageView
      navigation={props.navigation}
      navBarWithBack={{ title: <HeaderTitleAndSubtitle title={I18n.t('form.myAnswers')} subtitle={I18n.t('form.tabName')} /> }}>
      {renderPage()}
    </PageView>
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    const state = moduleConfig.getState(gs);
    const formDistributions = state.forms.data
      .filter(form => !form.archived)
      .map(form => {
        return {
          ...form,
          distributions: state.distributions.data.filter(d => d.formId === form.id),
        } as IFormDistributions;
      })
      .sort((a, b) => (a.distributions[0].dateSending < b.distributions[0].dateSending ? 1 : -1));
    return {
      formDistributions,
      initialLoadingState:
        state.distributions.isPristine || state.distributions.isPristine
          ? AsyncPagedLoadingState.PRISTINE
          : AsyncPagedLoadingState.DONE,
      session: getUserSession(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchDistributions: tryAction(fetchFormDistributionsAction, undefined, true),
        fetchForms: tryAction(fetchFormsReceivedAction, undefined, true),
      },
      dispatch,
    ),
)(FormDistributionListScreen);
