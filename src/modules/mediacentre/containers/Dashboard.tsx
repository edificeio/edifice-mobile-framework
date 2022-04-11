import I18n from 'i18n-js';
import * as React from 'react';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PageView } from '~/framework/components/page';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchExternalsAction } from '~/modules/mediacentre/actions/externals';
import { addFavoriteAction, fetchFavoritesAction, removeFavoriteAction } from '~/modules/mediacentre/actions/favorites';
import { searchResourcesAction, searchResourcesAdvancedAction } from '~/modules/mediacentre/actions/search';
import { fetchSignetsAction } from '~/modules/mediacentre/actions/signets';
import { fetchTextbooksAction } from '~/modules/mediacentre/actions/textbooks';
import { AdvancedSearchParams } from '~/modules/mediacentre/components/AdvancedSearchModal';
import { getExternalsState } from '~/modules/mediacentre/state/externals';
import { getFavoritesState } from '~/modules/mediacentre/state/favorites';
import { getSearchState } from '~/modules/mediacentre/state/search';
import { ISignets, getSignetsState } from '~/modules/mediacentre/state/signets';
import { getTextbooksState } from '~/modules/mediacentre/state/textbooks';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';
import ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { PageContainer } from '~/ui/ContainerContent';

import HomePageContainer from './HomePage';

type IDashboardProps = {
  externals: Resource[];
  favorites: Resource[];
  navigation: { navigate };
  search: Resource[];
  signets: ISignets;
  textbooks: Resource[];

  addFavorite: (id: string, resource: Resource) => any;
  fetchExternals: () => any;
  fetchFavorites: () => any;
  fetchSignets: () => any;
  fetchTextbooks: () => any;
  removeFavorite: (id: string, source: Source) => any;
  searchResources: (query: string) => any;
  searchResourcesAdvanced: (params: AdvancedSearchParams) => any;
};

export class Dashboard extends React.PureComponent<IDashboardProps> {
  componentDidMount() {
    this.props.fetchExternals();
    this.props.fetchFavorites();
    this.props.fetchTextbooks();
    this.props.fetchSignets();
  }

  public render() {
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('mediacentre.mediacentre'),
          style: {
            backgroundColor: '#F53B56',
          },
        }}>
        <PageContainer>
          <ConnectionTrackingBar />
          <HomePageContainer {...this.props} {...this.state} />
        </PageContainer>
      </PageView>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  const externals = getExternalsState(state).data;
  const favorites = getFavoritesState(state).data;
  const search = getSearchState(state).data;
  const signets = getSignetsState(state).data;
  const textbooks = getTextbooksState(state).data;

  return {
    externals,
    favorites,
    search,
    signets,
    textbooks,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      addFavorite: addFavoriteAction,
      fetchFavorites: fetchFavoritesAction,
      fetchExternals: fetchExternalsAction,
      fetchSignets: fetchSignetsAction,
      fetchTextbooks: fetchTextbooksAction,
      removeFavorite: removeFavoriteAction,
      searchResources: searchResourcesAction,
      searchResourcesAdvanced: searchResourcesAdvancedAction,
    },
    dispatch,
  );
};

export default withViewTracking('mediacentre')(connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Dashboard)));
