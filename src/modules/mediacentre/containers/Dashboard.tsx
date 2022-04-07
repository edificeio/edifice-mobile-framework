import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationScreenProp, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import HomePageContainer from './HomePage';
//import SignetsPageContainer from './SignetsPage';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { standardNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { PageContainer } from '~/ui/ContainerContent';
import { PageView } from '~/framework/components/page';

import { Resource, Source } from '~/modules/mediacentre/utils/Resource';
import { getFavoritesState } from '~/modules/mediacentre/state/favorites';
import { getSearchState } from '~/modules/mediacentre/state/search';
import { getSignetsState, ISignets } from '~/modules/mediacentre/state/signets';
import { getTextbooksState } from '~/modules/mediacentre/state/textbooks';
import { fetchTextbooksAction } from '~/modules/mediacentre/actions/textbooks';
import { fetchFavoritesAction, addFavoriteAction, removeFavoriteAction } from '~/modules/mediacentre/actions/favorites';
import { fetchSignetsAction } from '~/modules/mediacentre/actions/signets';
import { searchResourcesAction, searchResourcesAdvancedAction } from '~/modules/mediacentre/actions/search';
import { AdvancedSearchParams } from '~/modules/mediacentre/components/AdvancedSearchModal';

type IDashboardProps = {
  favorites: Resource[];
  navigation: { navigate };
  search: Resource[];
  signets: ISignets;
  textbooks: Resource[];

  addFavorite: (id: string, resource: Resource) => any;
  fetchFavorites: () => any;
  fetchSignets: () => any;
  fetchTextbooks: () => any;
  removeFavorite: (id: string, source: Source) => any;
  searchResources: (query: string) => any;
  searchResourcesAdvanced: (params: AdvancedSearchParams) => any;
};

type IDashboardState = {
  ws: WebSocket | null;
  isWsConnected: boolean;
};

export class Dashboard extends React.PureComponent<IDashboardProps, IDashboardState> {
  constructor(props) {
    super(props);

    this.state = {
      ws: null,
      isWsConnected: false,
    };
  }

  componentDidMount() {
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
  const favorites = getFavoritesState(state).data;
  const search = getSearchState(state).data;
  const signets = getSignetsState(state).data;
  const textbooks = getTextbooksState(state).data;

  return {
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
