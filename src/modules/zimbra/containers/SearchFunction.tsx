import React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MailListContainer from './MailList';

import { Input } from '~/modules/zimbra/components/SearchFunction';
import { standardNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { CommonStyles } from '~/styles/common/styles';
import { Icon } from '~/ui';
import { PageContainer } from '~/ui/ContainerContent';
import { Header as HeaderComponent } from '~/ui/headers/Header';
import { HeaderAction } from '~/ui/headers/NewHeader';

type SearchProps = {
  navigation: any;
};

type SearchState = {
  isShownHeader: boolean;
  searchText: string;
};

export class SearchContainer extends React.PureComponent<SearchProps, SearchState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        header: null,
      },
      navigation,
    );
  };

  constructor(props) {
    super(props);

    this.state = {
      isShownHeader: true,
      searchText: '',
    };
  }

  setHeaderVisibility = (isShown: boolean) => {
    this.setState({ isShownHeader: !isShown });
  };

  render() {
    const { navigation } = this.props;
    return (
      <PageContainer>
        {this.state.isShownHeader && (
          <HeaderComponent>
            <Icon name="search2" size={20} color="white" style={{ marginHorizontal: 10 }} />
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Input value={this.state.searchText} onChange={text => this.setState({ searchText: text })} />
              <HeaderAction name="close2" onPress={() => navigation.goBack()} />
            </View>
          </HeaderComponent>
        )}

        <MailListContainer
          {...this.props}
          setSearchHeaderVisibility={isShown => this.setHeaderVisibility(isShown)}
          isSearch
          searchString={this.state.searchText}
        />
      </PageContainer>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer);
