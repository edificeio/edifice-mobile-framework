import I18n from 'i18n-js';
import { createStackNavigator } from 'react-navigation-stack';

import Details from './containers/Details';
import ContainerItems from './containers/Items';
import { FilterId } from './types';
import {
  addMenu,
  backMenu,
  copyMenu,
  createMenu,
  deleteMenu,
  trashMenu,
  downloadMenu,
  emptyMenu,
  moveMenu,
  nbSelectedMenu,
  renameMenu,
  separatorMenu,
  restoreMenu,
  titleMenu,
} from './utils/menus';

import withViewTracking from '~/framework/util/tracker/withViewTracking';

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
            items: [backMenu(), nbSelectedMenu(), separatorMenu(), copyMenu(), downloadMenu()],
          },
          {
            filter: FilterId.owner,
            items: [
              backMenu(),
              nbSelectedMenu(),
              separatorMenu(),
              renameMenu(),
              trashMenu(),
              copyMenu(),
              moveMenu(),
              downloadMenu(),
            ],
          },
          {
            filter: FilterId.trash,
            items: [backMenu(), nbSelectedMenu(), separatorMenu(), deleteMenu(), restoreMenu(), downloadMenu()],
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
