import { IFolder } from '~/framework/modules/workspace/reducer';
import { IEntcoreWorkspaceFolder } from '~/framework/modules/workspace/service';

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
  let notFormatedLength = 0;

  do {
    notFormatedLength = result.notFormated.length;
    result = result.notFormated.reduce((acc, item) => insertItem(acc, item), {
      treeItems: result.treeItems,
      notFormated: [] as IEntcoreWorkspaceFolder[],
    });
  } while (result.notFormated.length !== notFormatedLength);
  return result.treeItems;
};
