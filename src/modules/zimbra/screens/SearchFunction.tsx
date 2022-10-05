import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { FakeHeader_Container, FakeHeader_Row, HeaderAction } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import MailListContainer from '~/modules/zimbra/components/MailListContainer';

const styles = StyleSheet.create({
  searchIcon: {
    marginHorizontal: UI_SIZES.spacing.medium,
  },
  textInput: {
    flex: 1,
    ...TextFontStyle.Regular,
    ...TextSizeStyle.Medium,
    lineHeight: 22,
    color: theme.ui.text.inverse,
  },
});

type SearchProps = NavigationInjectedProps;

type SearchState = {
  isShownHeader: boolean;
  searchText: string;
};

const Input = ({ value, onChange }: { value: string; onChange: (text: string) => void }) => {
  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState(value);

  React.useEffect(() => {
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => onChange(currentValue), 500);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentValue]);

  return (
    <TextInput
      style={styles.textInput}
      placeholder={I18n.t('Search')}
      placeholderTextColor={theme.ui.text.inverse}
      numberOfLines={1}
      defaultValue={currentValue}
      onChangeText={text => updateCurrentValue(text)}
    />
  );
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
          this.state.isShownHeader ? (
            <FakeHeader_Container>
              <FakeHeader_Row>
                <Icon name="search2" size={20} color={theme.ui.text.inverse} style={styles.searchIcon} />
                <Input value={this.state.searchText} onChange={text => this.setState({ searchText: text })} />
                <HeaderAction iconName="close2" onPress={() => navigation.goBack()} />
              </FakeHeader_Row>
            </FakeHeader_Container>
          ) : null
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
