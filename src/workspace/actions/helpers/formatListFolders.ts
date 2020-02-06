/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

// ADAPTER ----------------------------------------------------------------------------------------

type IResult = {
  treeItems: ITreeItem[];
  notFormated: IBackendFolder[];
};

export function formatResults(data: IBackendFolder[]): ITreeItem[] {
  let result: IResult = {
    treeItems: [],
    notFormated: data,
  };
  let notFormatedLength = 0;

  do {
    notFormatedLength = result.notFormated.length;
    result = result.notFormated.reduce((acc, item) => insertItem(acc, item), {
      treeItems: result.treeItems,
      notFormated: [] as IBackendFolder[],
    });
  } while (result.notFormated.length !== notFormatedLength);
  return result.treeItems;
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

function findParent(treeItems: ITreeItem[], parentId: string): ITreeItem | null {
  return treeItems.reduce(
    (acc, item) =>
      acc ? acc : item.id === parentId ? item : item.children ? findParent(item.children, parentId) : acc,
    null as ITreeItem | null
  );
}

function mapObject(item: IBackendFolder): ITreeItem {
  return {
    id: item._id,
    name: item.name,
    parentId: item.eParent ? item.eParent : "owner",
    sortNo: item.name,
    children: [],
  };
}

// Folder TYPE -------------------------------------------------------------------------------------------

export type IBackendFolder = {
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

export type ITreeItem = {
  id: string;
  name: string;
  parentId: string;
  sortNo: string;
  children: ITreeItem[];
};
