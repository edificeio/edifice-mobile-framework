import I18n from 'i18n-js';
import * as React from 'react';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchWithCache } from '~/infra/fetchWithCache';
import { fetchExternalsAction } from '~/modules/mediacentre/actions/externals';
import { addFavoriteAction, fetchFavoritesAction, removeFavoriteAction } from '~/modules/mediacentre/actions/favorites';
import { searchResourcesAction, searchResourcesAdvancedAction } from '~/modules/mediacentre/actions/search';
import { fetchSignetsAction } from '~/modules/mediacentre/actions/signets';
import { fetchTextbooksAction } from '~/modules/mediacentre/actions/textbooks';
import { IField, ISources } from '~/modules/mediacentre/components/AdvancedSearchModal';
import { HomePage } from '~/modules/mediacentre/components/HomePage';
import { IExternals, getExternalsState } from '~/modules/mediacentre/state/externals';
import { IFavorites, getFavoritesState } from '~/modules/mediacentre/state/favorites';
import { ISearch, getSearchState } from '~/modules/mediacentre/state/search';
import { ISignets, getSignetsState } from '~/modules/mediacentre/state/signets';
import { ITextbooks, getTextbooksState } from '~/modules/mediacentre/state/textbooks';
import { IResource, Source } from '~/modules/mediacentre/utils/Resource';
import ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { PageContainer } from '~/ui/ContainerContent';

type IHomeScreenProps = {
  externals: IExternals;
  favorites: IFavorites;
  isFetchingSearch: boolean;
  isFetchingSections: boolean;
  navigation: { navigate };
  search: ISearch;
  signets: ISignets;
  textbooks: ITextbooks;
  userId: string;

  postAddFavorite: (id: string, resource: IResource) => any;
  fetchExternals: (sources: string[]) => any;
  fetchFavorites: () => any;
  fetchSignets: (userId: string) => any;
  fetchTextbooks: () => any;
  postRemoveFavorite: (id: string, source: Source) => any;
  searchResources: (sources: string[], query: string) => any;
  searchResourcesAdvanced: (fields: IField[], sources: ISources) => any;
} & NavigationInjectedProps;

interface IHomeScreenState {
  isFetchingSources: boolean;
  sources: string[];
}

export class HomeScreen extends React.PureComponent<IHomeScreenProps, IHomeScreenState> {
  constructor(props: IHomeScreenProps) {
    super(props);
    this.state = {
      isFetchingSources: true,
      sources: [],
    };
    this.fetchSources();
    this.props.fetchFavorites();
    this.props.fetchTextbooks();
    this.props.fetchSignets(this.props.userId);
  }

  fetchSources = async () => {
    const response = await fetchWithCache(`/mediacentre`, {
      method: 'get',
    });
    let html = response?.toString();
    if (!html) {
      return [];
    }
    html = html.replace(/\s/g, '');
    const startIndex = html.indexOf('sources=[');
    const endIndex = html.indexOf('];');
    if (!startIndex || !endIndex || startIndex + 9 > endIndex - 2) {
      this.setState({ isFetchingSources: false });
      return [];
    }
    html = html.substring(startIndex + 9, endIndex - 2).replaceAll('"', '');
    const sources = html.split(',');
    this.setState({
      isFetchingSources: false,
      sources,
    });
    this.props.fetchExternals(sources);
  };

  addFavorite = async (resourceId: string, resource: IResource) => {
    try {
      await this.props.postAddFavorite(resourceId, resource);
      Toast.showSuccess(I18n.t('mediacentre.favorite-added'), {
        position: Toast.position.BOTTOM,
        mask: false,
      });
      this.props.fetchFavorites();
    } catch (err) {
      Toast.show(I18n.t('common.error.text'));
    }
  };

  removeFavorite = async (resourceId: string, resource: Source) => {
    try {
      await this.props.postRemoveFavorite(resourceId, resource);
      Toast.showSuccess(I18n.t('mediacentre.favorite-removed'), {
        position: Toast.position.BOTTOM,
        mask: false,
      });
      this.props.fetchFavorites();
    } catch (err) {
      Toast.show(I18n.t('common.error.text'));
    }
  };

  renderEmptyState = () => {
    if (this.state.isFetchingSources) {
      return <LoadingIndicator />;
    }
    return <EmptyScreen svgImage="empty-mediacentre" title={I18n.t('mediacentre.empty-screen')} />;
  };

  public render() {
    return (
      <PageView navigation={this.props.navigation} navBarWithBack={{ title: I18n.t('mediacentre.tabName') }}>
        <PageContainer>
          <ConnectionTrackingBar />
          {!this.state.sources.length ? (
            this.renderEmptyState()
          ) : (
            <HomePage
              {...this.props}
              sources={this.state.sources}
              addFavorite={this.addFavorite}
              removeFavorite={this.removeFavorite}
            />
          )}
        </PageContainer>
      </PageView>
    );
  }
}

const setFavorites = (resources: IResource[], favorites: string[]) => {
  for (const resource of resources) {
    resource.favorite = favorites.includes(String(resource.id));
  }
};

const mapStateToProps: (state: any) => any = state => {
  const externals = getExternalsState(state);
  const favorites = getFavoritesState(state);
  const search = getSearchState(state);
  const signets = getSignetsState(state);
  const textbooks = getTextbooksState(state);
  const userId = getUserSession().user.id;

  const favIds = favorites.data.map(favorite => String(favorite.id));
  setFavorites(externals.data, favIds);
  setFavorites(search.data, favIds);
  setFavorites(signets.data.orientationSignets, favIds);
  setFavorites(signets.data.sharedSignets, favIds);
  setFavorites(textbooks.data, favIds);

  return {
    externals: externals.data,
    favorites: favorites.data,
    isFetchingSearch: search.isFetching,
    isFetchingSections:
      externals.isFetching || favorites.isFetching || search.isFetching || signets.isFetching || textbooks.isFetching,
    search: search.data,
    signets: signets.data,
    textbooks: textbooks.data,
    userId,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      postAddFavorite: addFavoriteAction,
      fetchFavorites: fetchFavoritesAction,
      fetchExternals: fetchExternalsAction,
      fetchSignets: fetchSignetsAction,
      fetchTextbooks: fetchTextbooksAction,
      postRemoveFavorite: removeFavoriteAction,
      searchResources: searchResourcesAction,
      searchResourcesAdvanced: searchResourcesAdvancedAction,
    },
    dispatch,
  );
};

export default withViewTracking('mediacentre')(connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(HomeScreen)));
