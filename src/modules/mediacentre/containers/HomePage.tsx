import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { AdvancedSearchParams } from '~/modules/mediacentre/components/AdvancedSearchModal';
import { HomePage } from '~/modules/mediacentre/components/HomePage';
import { ISignets } from '~/modules/mediacentre/state/signets';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

type IHomePageContainerProps = {
  externals: Resource[];
  favorites: Resource[];
  navigation: any;
  search: Resource[];
  signets: ISignets;
  sources: string[];
  textbooks: Resource[];

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
  searchResources: (sources: string[], query: string) => any;
  searchResourcesAdvanced: (params: AdvancedSearchParams) => any;
};

type IHomePageContainerState = {
  includePMB: boolean;
};

class HomePageContainer extends React.PureComponent<IHomePageContainerProps, IHomePageContainerState> {
  constructor(props: IHomePageContainerProps) {
    super(props);
    this.state = {
      includePMB: false,
    };
  }

  componentDidUpdate() {
    if (!this.state.includePMB) {
      this.setState({ includePMB: this.props.externals.some(resource => resource.source === Source.PMB) });
    }
  }

  public render() {
    return <HomePage {...this.props} includePMB={this.state.includePMB} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {};
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePageContainer);
