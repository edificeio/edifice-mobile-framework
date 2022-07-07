import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IResourceUriCaptureFunction } from '~/framework/util/notifications';
import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';
import { IStudentAndParentWordList, ITeacherWordList, IWordReport } from '~/modules/schoolbook/reducer';
import { Filter } from '../types';

type IEntcoreWorkspaceFolder = {
  _id: string;
  created: string;
  modified: string;
  owner: string;
  ownerName: string;
  name: string;
  application: string;
  shared: [];
  ancestors: [];
  deleted: boolean;
  eParent: string | null;
  eType: string;
  externalId: string;
  inheritedShares: [];
  parents: [];
};
type IEntcoreWorkspaceFolderList = IEntcoreWorkspaceFolder[];

export type IWorkspaceFolder = {
  id: string;
  name: string;
  parentId: string;
  sortNo: string;
  children: IWorkspaceFolder[];
};

type IResult = {
  treeItems: IWorkspaceFolder[];
  notFormated: IEntcoreWorkspaceFolderList;
};

function mapObject(item: IEntcoreWorkspaceFolder): IWorkspaceFolder {
  return {
    id: item._id,
    name: item.name,
    parentId: item.eParent ? item.eParent : 'owner',
    sortNo: item.name,
    children: [],
  };
}

function findParent(treeItems: ITreeItem[], parentId: string): ITreeItem | null {
  return treeItems.reduce(
    (acc, item) => (acc ? acc : item.id === parentId ? item : item.children ? findParent(item.children, parentId) : acc),
    null as ITreeItem | null,
  );
}

function insertItem(result: IResult, item: IBackendFolder): IResult {
  const { treeItems, notFormated } = result;

  if (!item.eParent) {
    treeItems.push(mapObject(item));
    return {
      treeItems,
      notFormated,
    };
  }
  const parent = findParent(treeItems, item.eParent);

  if (parent) {
    if (!parent.children) parent.children = [];
    parent.children.push(mapObject(item));
    return {
      treeItems,
      notFormated,
    };
  }
  return {
    treeItems,
    notFormated: [...notFormated, item],
  };
}

function workspaceFolderListAdapter(data: IEntcoreWorkspaceFolderList): IWorkspaceFolder[] {
  let result: IResult = {
    treeItems: [],
    notFormated: data,
  };
  let notFormatedLength = 0;

  do {
    notFormatedLength = result.notFormated.length;
    result = result.notFormated.reduce((acc, item) => insertItem(acc, item), {
      treeItems: result.treeItems,
      notFormated: [] as IEntcoreWorkspaceFolder[],
    });
  } while (result.notFormated.length !== data.length);
  return result.treeItems;
}

export const workspaceService = {
  files: {
    get: async (session: IUserSession, filter: Filter, parentId: string) => {
      let params = `?filter=${filter}`;

      if (!Object.values(Filter).includes(parentId as Filter)) {
        params += `&parentId=${parentId}`;
      }
      params += '&includeall=true';
      const api = `/workspace/documents${params}`;
      const files = (await fetchJSONWithCache(api)) as IEntcoreWorkspaceFolderList;
      return workspaceFolderListAdapter(files);
    },
  },
  folders: {
    list: async (session: IUserSession) => {
      const api = '/workspace/folders/list?filter=owner&hierarchical=true';
      const folderList = (await fetchJSONWithCache(api)) as IEntcoreWorkspaceFolderList;
      return workspaceFolderListAdapter(folderList);
    },
  },
};
