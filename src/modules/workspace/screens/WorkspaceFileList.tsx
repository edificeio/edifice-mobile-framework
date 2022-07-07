import I18n from 'i18n-js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { FlatList, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { HeaderBackAction, HeaderTitle } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import { fetchWorkspaceFilesAction } from '~/modules/workspace/actions';
import { newDownloadThenOpenAction } from '~/modules/workspace/actions/download';
import { WorkspaceFileListItem } from '~/modules/workspace/components/WorkspaceFileListItem';
import moduleConfig from '~/modules/workspace/moduleConfig';
import { Filter, IFile } from '~/modules/workspace/types';
import { CommonStyles } from '~/styles/common/styles';

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

interface IWorkspaceFileListEventProps {
  fetchFiles: (filter: Filter, parentId: string) => void;
  dispatch: ThunkDispatch<any, any, any>;
}

type IWorkspaceFileListProps = {
  files: IFile[];
  filter: Filter;
  isFetching: boolean;
  parentId: string;
} & NavigationInjectedProps &
  IWorkspaceFileListEventProps;

const WorkspaceFileList: React.FunctionComponent<IWorkspaceFileListProps> = (props: IWorkspaceFileListProps) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const isSelectionActive = selectedFiles.length > 0;

  const fetchFiles = () => {
    if (props.filter !== Filter.ROOT) {
      props.fetchFiles(props.filter, props.parentId);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const onGoBack = () => {
    if (isSelectionActive) {
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

  const selectFile = (file: IFile) => {
    if (selectedFiles.includes(file.id)) {
      setSelectedFiles(selectedFiles.filter(id => id !== file.id));
    } else {
      setSelectedFiles(selected => [...selected, file.id]);
    }
  };

  const onPressFile = (file: IFile) => {
    if (Platform.OS === 'ios' && !isSelectionActive && !file.isFolder) {
      return props.dispatch(newDownloadThenOpenAction({ item: file }));
    } else if (isSelectionActive) {
      return selectFile(file);
    }
    const { id, name: title, isFolder } = file;
    if (isFolder) {
      const filter = props.filter === Filter.ROOT ? id : props.filter;
      props.navigation.push(moduleConfig.routeName, { filter, parentId: id, title });
    } else {
      props.navigation.navigate(`${moduleConfig.routeName}/details`, { file, title });
    }
  };

  const navBarInfo = {
    left: (
      <>
        <HeaderBackAction onPress={onPressBackAction} />
        {isSelectionActive ? <HeaderTitle>{selectedFiles.length}</HeaderTitle> : null}
      </>
    ),
    title: isSelectionActive ? null : props.navigation.getParam('title'),
    style: {
      backgroundColor: isSelectionActive ? theme.palette.secondary.regular : theme.palette.primary.regular,
    },
  };

  const renderEmpty = () => {
    if (props.isFetching) return null;
    const image = props.parentId === Filter.TRASH ? 'empty-trash' : 'empty-workspace';
    const screen = Object.values(Filter).includes(props.parentId as Filter) ? props.parentId : 'subfolder';
    return (
      <EmptyScreen
        svgImage={image}
        title={I18n.t(`workspaceEmptyScreen.${screen}.title`)}
        text={I18n.t(`workspaceEmptyScreen.${screen}.text`)}
      />
    );
  };

  return (
    <PageView navigation={props.navigation} navBar={navBarInfo} onBack={onGoBack}>
      <FlatList
        data={props.files}
        renderItem={({ item }) => (
          <WorkspaceFileListItem
            item={item}
            isSelected={selectedFiles.includes(item.id)}
            onPressCallback={onPressFile}
            onLongPressCallback={selectFile}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item: IFile) => item.id}
        refreshControl={<RefreshControl refreshing={props.isFetching} onRefresh={fetchFiles} />}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={styles.listContainer}
      />
    </PageView>
  );
};

const mapStateToProps = (gs: any, props: any) => {
  const state = moduleConfig.getState(gs);
  const parentId = props.navigation.getParam('parentId');

  return {
    files: state.directories.data[parentId] || [],
    filter: props.navigation.getParam('filter'),
    isFetching: state.directories.isFetching,
    parentId,
    session: getUserSession(),
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => IWorkspaceFileListEventProps = (
  dispatch,
  getState,
) => ({
  fetchFiles: async (filter: Filter, parentId: string) => {
    return dispatch(fetchWorkspaceFilesAction(filter, parentId));
  },
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkspaceFileList);
