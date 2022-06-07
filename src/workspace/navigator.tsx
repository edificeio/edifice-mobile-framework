import I18n from 'i18n-js';
import { Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';

import withViewTracking from '~/framework/util/tracker/withViewTracking';

import Details from './containers/Details';
import ContainerItems from './containers/Items';
import { FilterId } from './types';
import {
  addMenu,
  backMenu,
  copyMenu,
  createMenu,
  deleteMenu,
  downloadMenu,
  emptyMenu,
  moveMenu,
  nbSelectedMenu,
  renameMenu,
  restoreMenu,
  separatorMenu,
  titleMenu,
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
        ],
        toolbarItems: [
          {
            filter: FilterId.root,
            items: [backMenu(), titleMenu(), emptyMenu()],
          },
        ],
        toolbarSelectedItems: [
          {
            filter: FilterId.root,
            items: Platform.select({
              ios: [backMenu(), nbSelectedMenu(), separatorMenu(), copyMenu()],
              default: [backMenu(), nbSelectedMenu(), separatorMenu(), copyMenu(), downloadMenu()],
            }),
          },
          {
            filter: FilterId.owner,
            items: Platform.select({
              ios: [backMenu(), nbSelectedMenu(), separatorMenu(), renameMenu(), trashMenu(), copyMenu(), moveMenu()],
              default: [
                backMenu(),
                nbSelectedMenu(),
                separatorMenu(),
                renameMenu(),
                trashMenu(),
                copyMenu(),
                moveMenu(),
                downloadMenu(),
              ],
            }),
          },
          {
            filter: FilterId.trash,
            items: Platform.select({
              ios: [backMenu(), nbSelectedMenu(), separatorMenu(), deleteMenu(), restoreMenu()],
              default: [backMenu(), nbSelectedMenu(), separatorMenu(), deleteMenu(), restoreMenu(), downloadMenu()],
            }),
          },
        ],
      },
    },
    WorkspaceDetails: {
      screen: Details,
      params: {
        toolbarItems: [
          {
            filter: FilterId.root,
            items: [backMenu(), titleMenu(), emptyMenu()],
          },
        ],
      },
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
