import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { NavigationEventSubscription } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import { removeAccents } from '~/framework/util/string';
import Notifier from '~/infra/notifier/container';
import { listAction } from '~/modules/workspace/actions/list';
import { WorkspaceFileListItem } from '~/modules/workspace/components/WorkspaceFileListItem';
import { FilterId, IItem, IItemsProps, IState } from '~/modules/workspace/types';
import { getEmptyScreen } from '~/modules/workspace/utils/empty';
import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { IDispatchProps } from '~/types';
import { ISelectedProps } from '~/types/ievents';

const styles = StyleSheet.create({
  separator: {
    borderBottomColor: CommonStyles.borderColorLighter,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: layoutSize.LAYOUT_80,
  },
  listContainer: {
    backgroundColor: CommonStyles.lightGrey,
    flexGrow: 1,
  },
});

export class WorkspaceFileList extends React.Component<IDispatchProps & IItemsProps & ISelectedProps, { isFocused: boolean }> {
  focusListener!: NavigationEventSubscription;

  constructor(props: IDispatchProps & IItemsProps & ISelectedProps) {
    super(props);
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

  private sortItems(firstItem: IItem, secondItem: IItem): number {
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

    return sortByType(firstItem, secondItem) !== 0 ? sortByType(firstItem, secondItem) : sortByName(firstItem, secondItem);
  }

  public render(): React.ReactNode {
    const { items, isFetching, selectedItems } = this.props;
    const parentId = this.props.navigation.getParam('parentId') || null;
    const values = Object.values(items);

    if (values.length === 0 && !isFetching) {
      return <View style={{backgroundColor: 'red', flex: 1}} />;
    }

    const itemsArray = parentId === FilterId.root ? values : values.sort(this.sortItems);

    const multiSelect = Object.keys(selectedItems).length > 0;

    return (
      <PageView navigation={this.props.navigation}>
        <Notifier id="workspace" />
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={itemsArray}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item: IItem) => item.id}
          refreshing={this.props.isFetching}
          onRefresh={this.makeRequest}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={this.makeRequest} />}
          renderItem={({ item }) => (
            <WorkspaceFileListItem
              item={item}
              onEvent={this.props.onEvent}
              selected={selectedItems[item.id]}
              multiSelect={multiSelect}
            />
          )}
          ListEmptyComponent={getEmptyScreen(parentId)}
        />
      </PageView>
    );
  }
}

const mapStateToProps = (state: any, props: any) => {
  /*const parentId = props.navigation.getParam('parentId');
  const parentIdItems = state.data[parentId] || {
    isFetching: null,
    data: {},
  };*/

  return {
    /*items: parentIdItems.data,
    isFetching: parentIdItems.isFetching,*/
    items: [],
    session: getUserSession(),
  };
};

export default connect(mapStateToProps, dispatch => ({ dispatch }))(WorkspaceFileList);
