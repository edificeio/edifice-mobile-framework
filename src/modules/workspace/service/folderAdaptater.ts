import { IFolder } from '~/modules/workspace/reducer';

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

type IResult = {
  treeItems: IFolder[];
  notFormated: IEntcoreWorkspaceFolderList;
};

function mapObject(item: IEntcoreWorkspaceFolder): IFolder {
  return {
    id: item._id,
    name: item.name,
    parentId: item.eParent ? item.eParent : 'owner',
    sortNo: item.name,
    children: [],
  };
}

function findParent(treeItems: IFolder[], parentId: string): IFolder | null {
  return treeItems.reduce(
    (acc, item) => (acc ? acc : item.id === parentId ? item : item.children ? findParent(item.children, parentId) : acc),
    null as IFolder | null,
  );
}

function insertItem(result: IResult, item: IEntcoreWorkspaceFolder): IResult {
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

export const workspaceFolderListAdapter = (data: IEntcoreWorkspaceFolderList): IFolder[] => {
  let result: IResult = {
    treeItems: [],
    notFormated: data,
  };

  do {
    result = result.notFormated.reduce((acc, item) => insertItem(acc, item), {
      treeItems: result.treeItems,
      notFormated: [] as IEntcoreWorkspaceFolder[],
    });
  } while (result.notFormated.length !== data.length);
  return result.treeItems;
};
