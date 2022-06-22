import I18n from 'i18n-js';
import { Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';

import withViewTracking from '~/framework/util/tracker/withViewTracking';

import Details from './containers/Details';
import ContainerItems from './containers/Items';
import { FilterId } from './types';
import {
  addMenu,
  copyMenu,
  createMenu,
  deleteMenu,
  downloadMenu,
  moveMenu,
  renameMenu,
  restoreMenu,
  trashMenu,
} from './utils/menus';

const WorkspaceNavigator = createStackNavigator(
  {
    Workspace: {
      screen: ContainerItems,
      params: {
        popupItems: [
          {
            filter: FilterId.owner,
            items: [addMenu(), createMenu()],
          },
          {
            filter: FilterId.shared,
            items: [addMenu()],
          },
        ],
        toolbarActions: [
          {
            filter: FilterId.root,
            items: Platform.select({
              ios: [copyMenu()],
              default: [copyMenu(), downloadMenu()],
            }),
          },
          {
            filter: FilterId.owner,
            items: Platform.select({
              ios: [renameMenu(), trashMenu(), copyMenu(), moveMenu()],
              default: [renameMenu(), trashMenu(), copyMenu(), moveMenu(), downloadMenu()],
            }),
          },
          {
            filter: FilterId.trash,
            items: Platform.select({
              ios: [deleteMenu(), restoreMenu()],
              default: [deleteMenu(), restoreMenu(), downloadMenu()],
            }),
          },
        ],
      },
    },
    WorkspaceDetails: {
      screen: Details,
    },
  },
  {
    initialRouteParams: {
      filter: 'root',
      parentId: 'root',
      title: I18n.t('workspace'),
    },
    headerMode: 'none',
  },
);

export default withViewTracking('Workspace')(WorkspaceNavigator);
