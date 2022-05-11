import I18n from 'i18n-js';
import * as React from 'react';
import Toast from 'react-native-tiny-toast';
import { withNavigationFocus } from 'react-navigation';
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
import { Field, Sources } from '~/modules/mediacentre/components/AdvancedSearchModal';
import { HomePage } from '~/modules/mediacentre/components/HomePage';
import { IExternalsState, getExternalsState } from '~/modules/mediacentre/state/externals';
import { IFavoritesState, getFavoritesState } from '~/modules/mediacentre/state/favorites';
import { ISearchState, getSearchState } from '~/modules/mediacentre/state/search';
import { ISignetsState, getSignetsState } from '~/modules/mediacentre/state/signets';
import { ITextbooksState, getTextbooksState } from '~/modules/mediacentre/state/textbooks';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';
import ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { PageContainer } from '~/ui/ContainerContent';

type IHomePageProps = {
  externals: IExternalsState;
  favorites: IFavoritesState;
  navigation: { navigate };
  search: ISearchState;
  signets: ISignetsState;
  textbooks: ITextbooksState;
  userId: string;

  postAddFavorite: (id: string, resource: Resource) => any;
  fetchExternals: (sources: string[]) => any;
  fetchFavorites: () => any;
  fetchSignets: (userId: string) => any;
  fetchTextbooks: () => any;
  postRemoveFavorite: (id: string, source: Source) => any;
  searchResources: (sources: string[], query: string) => any;
  searchResourcesAdvanced: (fields: Field[], sources: Sources) => any;
};

type IHomePageState = {
  isFetchingSources: boolean;
  sources: string[];
};

export class HomeContainer extends React.PureComponent<IHomePageProps, IHomePageState> {
  constructor(props: IHomePageProps) {
    super(props);
    this.state = {
      isFetchingSources: true,
      sources: [],
    };
    this.fetchSources();
  }

  componentDidMount() {
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

  addFavorite = async (resourceId: string, resource: Resource) => {
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
      <PageView navigation={this.props.navigation} navBarWithBack={{ title: I18n.t('mediacentre.mediacentre') }}>
        <PageContainer>
          <ConnectionTrackingBar />
          {!this.state.sources.length ? (
            this.renderEmptyState()
          ) : (
            <HomePage {...this.props} {...this.state} addFavorite={this.addFavorite} removeFavorite={this.removeFavorite} />
          )}
        </PageContainer>
      </PageView>
    );
  }
}

const setFavorites = (resources: Resource[], favorites: string[]) => {
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
    externals,
    favorites,
    search,
    signets,
    textbooks,
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

export default withViewTracking('mediacentre')(connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(HomeContainer)));
