/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import I18n from 'i18n-js';

import { IAction } from '~/infra/redux/async';
import { ITreeItem } from '~/modules/workspace/actions/helpers/formatListFolders';
import { actionTypesFolder } from '~/modules/workspace/actions/listFolders';

const initialState: ITreeItem[] = [
  {
    id: 'owner',
    name: I18n.t('owner'),
    parentId: '0',
    sortNo: 'owner',
    children: [],
  },
];

export default (state = initialState, action: IAction<ITreeItem[]>) => {
  switch (action.type) {
    case actionTypesFolder.received:
      return [
        {
          ...state[0],
          children: action.data,
        },
      ];
    default:
      return state;
  }
};
