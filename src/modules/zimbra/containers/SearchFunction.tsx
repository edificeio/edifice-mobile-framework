import React from 'react';
import { View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MailListContainer from './MailList';

import { Input } from '~/modules/zimbra/components/SearchFunction';
import { Icon } from '~/ui';
import { PageView } from '~/framework/components/page';
import { FakeHeader_Container, FakeHeader_Row, HeaderAction, HeaderRight } from '~/framework/components/header';

type SearchProps = {} & NavigationInjectedProps;

type SearchState = {
  isShownHeader: boolean;
  searchText: string;
};

export class SearchContainer extends React.PureComponent<SearchProps, SearchState> {

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
      <PageView
        path={navigation.state.routeName}
        navBarNode={
          <FakeHeader_Container>
            <FakeHeader_Row style={{alignItems: 'stretch'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  marginRight: 60,
                }}>
                <Icon name="search2" size={20} color="white" style={{ marginHorizontal: 20 }} />
                <Input value={this.state.searchText} onChange={text => this.setState({ searchText: text })} />
              </View>
              <HeaderRight>
                <HeaderAction iconName="close2" onPress={() => navigation.goBack()} />
              </HeaderRight>
            </FakeHeader_Row>
          </FakeHeader_Container>
        }>
        <MailListContainer
          {...this.props}
          setSearchHeaderVisibility={isShown => this.setHeaderVisibility(isShown)}
          isSearch
          searchString={this.state.searchText}
        />
      </PageView>
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
