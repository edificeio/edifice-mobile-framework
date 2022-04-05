import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { HomePage } from '../components/HomePage';
import { Resource, Source } from '../utils/Resource';
import { ISignets } from '~/modules/mediacentre/state/signets';
import { AdvancedSearchParams } from '~/modules/mediacentre/components/AdvancedSearchModal';

type IHomePageContainerProps = {
  favorites: Resource[];
  navigation: any;
  search: Resource[];
  signets: ISignets;
  textbooks: Resource[];

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
  searchResources: (query: string) => any;
  searchResourcesAdvanced: (params: AdvancedSearchParams) => any;
};

type HomePageContainerState = {
};

class HomePageContainer extends React.PureComponent<IHomePageContainerProps, HomePageContainerState> {
  constructor(props) {
    super(props);
  }

  public render() {
    return <HomePage {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {};
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePageContainer);
