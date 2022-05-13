import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { FakeHeader_Container, FakeHeader_Row, HeaderAction, HeaderRight } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { Input } from '~/modules/zimbra/components/SearchFunction';
import { Icon } from '~/ui/icons/Icon';

import MailListContainer from './MailList';

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'stretch',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 60,
  },
  searchIcon: {
    marginHorizontal: 20,
  },
});

type SearchProps = NavigationInjectedProps;

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
        navigation={navigation}
        navBarNode={
          <FakeHeader_Container>
            <FakeHeader_Row style={styles.headerRow}>
              <View style={styles.searchContainer}>
                <Icon name="search2" size={20} color="white" style={styles.searchIcon} />
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
