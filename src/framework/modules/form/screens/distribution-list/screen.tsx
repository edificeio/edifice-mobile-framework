import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { RefreshControl, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchFormDistributionsAction, fetchFormsReceivedAction } from '~/framework/modules/form/actions';
import { FormDistributionCard } from '~/framework/modules/form/components/FormDistributionCard';
import FormDistributionListModal from '~/framework/modules/form/components/FormDistributionListModal';
import { DistributionStatus, IForm } from '~/framework/modules/form/model';
import moduleConfig from '~/framework/modules/form/module-config';
import { FormNavigationParams, formRouteNames } from '~/framework/modules/form/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import { FormDistributionListScreenPrivateProps, IFormDistributions } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<FormNavigationParams, typeof formRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('form.formDistributionListScreen.title'),
});

const FormDistributionListScreen = (props: FormDistributionListScreenPrivateProps) => {
  const modalBoxRef = React.useRef<ModalBoxHandle>(null);
  const [modalDistributions, setModalDistributions] = React.useState<IFormDistributions | undefined>();

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchList = async () => {
    try {
      await props.fetchDistributions();
      await props.fetchForms();
    } catch {
      throw new Error();
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

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchOnNavigation();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const openDistribution = (id: number, status: DistributionStatus, form: IForm) => {
    modalBoxRef.current?.doDismissModal();
    setTimeout(() => {
      props.navigation.navigate(formRouteNames.distribution, {
        id,
        status,
        formId: form.id,
        title: form.title,
        editable: form.editable,
      });
    }, 500); // prevent freeze due to navigation when modal is not dismissed
  };

  const onPressItem = (item: IFormDistributions) => {
    const { distributions } = item;

    if (!item.multiple || !distributions.some(distribution => distribution.status === DistributionStatus.FINISHED)) {
      openDistribution(distributions[0].id, distributions[0].status, item as IForm);
    } else {
      setModalDistributions(item);
      modalBoxRef.current?.doShowModal();
    }
  };

  const renderEmpty = () => {
    return (
      <EmptyScreen
        svgImage="empty-form"
        title={I18n.t('form.formDistributionListScreen.emptyScreen.title')}
        text={I18n.t('form.formDistributionListScreen.emptyScreen.text')}
      />
    );
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderDistributionList = () => {
    return (
      <>
        <FlatList
          data={props.formDistributions}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <FormDistributionCard formDistributions={item} onOpen={onPressItem} />}
          refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={refresh} />}
          ListHeaderComponent={<View style={{ height: UI_SIZES.spacing.medium }} />}
          ListEmptyComponent={renderEmpty()}
        />
        <FormDistributionListModal
          ref={modalBoxRef}
          distributions={modalDistributions?.distributions}
          form={modalDistributions as IForm}
          openDistribution={openDistribution}
        />
      </>
    );
  };

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

  return <PageView>{renderPage()}</PageView>;
};

export default connect(
  (state: IGlobalState) => {
    const formState = moduleConfig.getState(state);
    const session = getSession();

    return {
      formDistributions: formState.forms.data
        .filter(form => !form.archived)
        .map(form => {
          return {
            ...form,
            distributions: formState.distributions.data.filter(d => d.formId === form.id),
          } as IFormDistributions;
        })
        .sort((a, b) => (a.distributions[0].dateSending < b.distributions[0].dateSending ? 1 : -1)),
      initialLoadingState: formState.distributions.isPristine ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      session,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchDistributions: tryAction(
          fetchFormDistributionsAction,
          undefined,
          true,
        ) as unknown as FormDistributionListScreenPrivateProps['fetchDistributions'],
        fetchForms: tryAction(
          fetchFormsReceivedAction,
          undefined,
          true,
        ) as unknown as FormDistributionListScreenPrivateProps['fetchForms'],
      },
      dispatch,
    ),
)(FormDistributionListScreen);
