import { IFolder } from '~/framework/modules/workspace/reducer';
import { IEntcoreWorkspaceFolder } from '~/framework/modules/workspace/service';

type IEntcoreWorkspaceFolderList = IEntcoreWorkspaceFolder[];

type IResult = {
  treeItems: IFolder[];
  notFormated: IEntcoreWorkspaceFolderList;
};

function mapObject(item: IEntcoreWorkspaceFolder): IFolder {
  return {
    children: [],
    id: item._id,
    name: item.name,
    parentId: item.eParent ? item.eParent : 'owner',
    sortNo: item.name,
  };
}

function findParent(treeItems: IFolder[], parentId: string): IFolder | null {
  return treeItems.reduce(
    (acc, item) => (acc ? acc : item.id === parentId ? item : item.children ? findParent(item.children, parentId) : acc),
    null as IFolder | null,
  );
}

function insertItem(result: IResult, item: IEntcoreWorkspaceFolder): IResult {
  const { notFormated, treeItems } = result;

  if (!item.eParent) {
    treeItems.push(mapObject(item));
    return {
      notFormated,
      treeItems,
    };
  }
  const parent = findParent(treeItems, item.eParent);

  if (parent) {
    if (!parent.children) parent.children = [];
    parent.children.push(mapObject(item));
    return {
      notFormated,
      treeItems,
    };
  }
  return {
    notFormated: [...notFormated, item],
    treeItems,
  };
}

export const workspaceFolderListAdapter = (data: IEntcoreWorkspaceFolderList): IFolder[] => {
  let result: IResult = {
    notFormated: data,
    treeItems: [],
  };
  let notFormatedLength = 0;

  do {
    notFormatedLength = result.notFormated.length;
    result = result.notFormated.reduce((acc, item) => insertItem(acc, item), {
      notFormated: [] as IEntcoreWorkspaceFolder[],
      treeItems: result.treeItems,
    });
  } while (result.notFormated.length !== notFormatedLength);
  return result.treeItems;
};
