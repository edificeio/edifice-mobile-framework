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
import { HeaderAction, HeaderBackAction, HeaderTitle } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import { downloadThenOpenWorkspaceFileAction, fetchWorkspaceFilesAction } from '~/modules/workspace/actions';
import { WorkspaceFileListItem } from '~/modules/workspace/components/WorkspaceFileListItem';
import moduleConfig from '~/modules/workspace/moduleConfig';
import { Filter, IFile } from '~/modules/workspace/reducer';
import { CommonStyles } from '~/styles/common/styles';
import { DropdownMenu, DropdownMenuAction } from '~/ui/DropdownMenu';

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
  previewFile: (file: IFile) => void;
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
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
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

  const showDropdown = () => {
    setDropdownVisible(true);
  };

  const hideDropdown = () => {
    setDropdownVisible(false);
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
      return props.previewFile(file);
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
    right: getRightIcons(),
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

  const getMenuActions = (): DropdownMenuAction[] | null => {
    if (isSelectionActive) {
      return null;
    }
    if (props.filter === Filter.OWNER) {
      return [
        {
          text: I18n.t('add-file'),
          icon: 'file-plus',
          onPress: () => true,
        },
        {
          text: I18n.t('create-folder'),
          icon: 'added_files',
          onPress: () => true,
        },
      ];
    } else if (props.filter === Filter.SHARED && props.parentId !== Filter.SHARED) {
      return [
        {
          text: I18n.t('add-file'),
          icon: 'file-plus',
          onPress: () => true,
        },
      ];
    }
    const showAddMenu = props.filter === Filter.OWNER || (props.filter === Filter.SHARED && props.parentId !== Filter.SHARED);
    return showAddMenu ? <HeaderAction iconName="add" onPress={showDropdown} /> : null;
  };

  const renderMenus = () => {
    const dropdownActions = getMenuActions();
    const dropdownColor = isSelectionActive ? theme.palette.secondary.regular : theme.palette.primary.regular;
    return dropdownActions ? (
      <DropdownMenu data={dropdownActions} isVisible={isDropdownVisible} color={dropdownColor} onTapOutside={hideDropdown} />
    ) : null;
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
      {renderMenus()}
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
  previewFile: async (file: IFile) => {
    return dispatch(downloadThenOpenWorkspaceFileAction(file));
  },
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkspaceFileList);
