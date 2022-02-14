import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { NavigationEventSubscription } from 'react-navigation';
import { connect } from 'react-redux';

import { removeAccents } from '~/framework/util/string';
import Notifier from '~/infra/notifier/container';
import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { IDispatchProps } from '~/types';
import { ISelectedProps } from '~/types/ievents';
import { PageContainer } from '~/ui/ContainerContent';
import { listAction } from '~/workspace/actions/list';
import { Item } from '~/workspace/components';
import { FilterId, IItem, IItemsProps, IState } from '~/workspace/types';
import { getEmptyScreen } from '~/workspace/utils/empty';
import withMenuWrapper from '~/workspace/utils/withMenuWrapper';
import withNavigationWrapper from '~/workspace/utils/withNavigationWrapper';
import withUploadErrorWrapper from '~/workspace/utils/withUploadErrorWrapper';
import withUploadWrapper from '~/workspace/utils/withUploadWrapper';

const styles = StyleSheet.create({
  separator: {
    borderBottomColor: CommonStyles.borderColorLighter,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: layoutSize.LAYOUT_80,
  },
});

export class Items extends React.Component<IDispatchProps & IItemsProps & ISelectedProps, { isFocused: boolean }> {
  focusListener!: NavigationEventSubscription;

  public UNSAFE_componentWillMount() {
    this.focusListener = this.props.navigation.addListener('willFocus', () => {
      this.makeRequest();
    });
  }

  public componentWillUnmount() {
    this.focusListener.remove();
  }

  public makeRequest() {
    const { dispatch } = this.props;

    dispatch(
      listAction({
        filter: this.props.navigation.getParam('filter'),
        parentId: this.props.navigation.getParam('parentId'),
      }),
    );
  }

  private sortItems(a: IItem, b: IItem): number {
    const sortByType = (a: IItem, b: IItem): number => {
      if (a.isFolder === b.isFolder) {
        return 0;
      } else {
        return a.isFolder ? -1 : 1;
      }
    };

    const sortByName = (a: IItem, b: IItem): number => {
      if (!b.name) return 1;
      if (!a.name) return -1;
      return removeAccents(a.name.toLocaleLowerCase()).localeCompare(removeAccents(b.name.toLocaleLowerCase()));
    };

    return sortByType(a, b) !== 0 ? sortByType(a, b) : sortByName(a, b);
  }

  public render(): React.ReactNode {
    const { items, isFetching, selectedItems } = this.props;
    const parentId = this.props.navigation.getParam('parentId') || null;
    const values = Object.values(items);

    if (values.length === 0) {
      if (isFetching === null) return <View style={{ backgroundColor: 'transparent' }} />;
    }

    const itemsArray = parentId === FilterId.root ? values : values.sort(this.sortItems);

    const multiSelect = Object.keys(selectedItems).length > 0;

    return (
      <PageContainer>
        <Notifier id="workspace" />
        <FlatList
          contentContainerStyle={{ backgroundColor: CommonStyles.lightGrey, flexGrow: 1 }}
          data={itemsArray}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item: IItem) => item.id}
          refreshing={this.props.isFetching}
          onRefresh={() => this.makeRequest()}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => this.makeRequest()} />}
          renderItem={({ item }) => (
            <Item item={item} onEvent={this.props.onEvent} selected={selectedItems[item.id]} multiSelect={multiSelect} />
          )}
          ListEmptyComponent={getEmptyScreen(parentId)}
        />
      </PageContainer>
    );
  }
}

const getProps = (stateItems: IState, props: any) => {
  const parentId = props.navigation.getParam('parentId');
  const parentIdItems = stateItems.data[parentId] || {
    isFetching: null,
    data: {},
  };

  return { isFetching: parentIdItems.isFetching, items: parentIdItems.data };
};

const mapStateToProps = (state: any, props: any) => {
  return {
    ...getProps(state.workspace.items, props),
  };
};

export default withMenuWrapper(
  withNavigationWrapper(withUploadWrapper(withUploadErrorWrapper(connect(mapStateToProps, {})(Items)))),
);
