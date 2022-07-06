import * as React from 'react';
import { useEffect, useState } from 'react';
import { FlatList, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { HeaderBackAction, HeaderTitle } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import { listAction } from '~/modules/workspace/actions/list';
import { WorkspaceFileListItem } from '~/modules/workspace/components/WorkspaceFileListItem';
import { Filter, IFile, IItem, IItemsProps } from '~/modules/workspace/types';
import { renderEmptyScreen } from '~/modules/workspace/utils/empty';
import { CommonStyles } from '~/styles/common/styles';
import { IDispatchProps } from '~/types';

import { newDownloadThenOpenAction } from '../actions/download';
import moduleConfig from '../moduleConfig';

const styles = StyleSheet.create({
  separator: {
    borderBottomColor: CommonStyles.borderColorLighter,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listContainer: {
    backgroundColor: CommonStyles.lightGrey,
    flexGrow: 1,
  },
});

type IWorkspaceFileListProps = IDispatchProps & IItemsProps;

const WorkspaceFileList: React.FunctionComponent<IWorkspaceFileListProps> = (props: IWorkspaceFileListProps) => {
  const [shouldFetch, setShouldFetch] = useState<boolean>(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const fetchFiles = () => {
    props.dispatch(
      listAction({
        filter: props.navigation.getParam('filter'),
        parentId: props.navigation.getParam('parentId'),
      }),
    );
  };

  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false);
      fetchFiles();
    }
  }, [shouldFetch]);

  const onGoBack = () => {
    if (selectedFiles.length) {
      setSelectedFiles([]);
      return false;
    }
    return true;
  };

  const onPressBackAction = () => {
    if (onGoBack()) {
      props.navigation.dispatch(NavigationActions.back());
    }
  };

  const selectFile = (file: IItem) => {
    if (selectedFiles.includes(file.id)) {
      setSelectedFiles(selectedFiles.filter(id => id !== file.id));
    } else {
      setSelectedFiles(selected => [...selected, file.id]);
    }
  };

  const onPressFile = (file: IItem) => {
    if (Platform.OS === 'ios' && !selectedFiles.length && !file.isFolder) {
      return props.dispatch(newDownloadThenOpenAction('', { item: file as IFile }));
    } else if (selectedFiles.length) {
      return selectFile(file);
    }
    const { id: parentId, name: title, isFolder } = file;
    if (isFolder) {
      let filter = props.navigation.getParam('filter');
      filter = filter === Filter.ROOT ? parentId : filter;
      props.navigation.push(moduleConfig.routeName, { filter, parentId, title });
    } else {
      props.navigation.navigate(`${moduleConfig.routeName}/details`, { file, title });
    }
  };

  const compareFiles = (a: IItem, b: IItem): number => {
    if (a.isFolder !== b.isFolder) {
      return a.isFolder ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  };

  const parentId = props.navigation.getParam('parentId') || null;
  const files = Object.values(props.files);
  files.sort(compareFiles);

  const navBarInfo = {
    left: (
      <>
        <HeaderBackAction onPress={onPressBackAction} />
        {selectedFiles.length ? <HeaderTitle>{selectedFiles.length}</HeaderTitle> : null}
      </>
    ),
    title: props.navigation.getParam('title'),
    style: {
      backgroundColor: selectedFiles.length ? theme.palette.secondary.regular : theme.palette.primary.regular,
    },
  };

  return (
    <PageView navigation={props.navigation} navBar={navBarInfo} onBack={onGoBack}>
      <FlatList
        data={files}
        renderItem={({ item }) => (
          <WorkspaceFileListItem
            item={item}
            isSelected={selectedFiles.includes(item.id)}
            onPressCallback={onPressFile}
            onLongPressCallback={selectFile}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item: IItem) => item.id}
        refreshControl={<RefreshControl refreshing={props.isFetching} onRefresh={fetchFiles} />}
        ListEmptyComponent={!props.isFetching ? renderEmptyScreen(parentId) : null}
        contentContainerStyle={styles.listContainer}
      />
    </PageView>
  );
};

const mapStateToProps = (state: any, props: any) => {
  const parentId = props.navigation.getParam('parentId');
  const parentIdItems = state.workspace2.items.data[parentId] || {
    isFetching: false,
    data: {},
  };

  return {
    files: parentIdItems.data,
    isFetching: parentIdItems.isFetching,
    session: getUserSession(),
  };
};

export default connect(mapStateToProps, dispatch => ({ dispatch }))(WorkspaceFileList);
