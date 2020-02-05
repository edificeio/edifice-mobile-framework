export const breadthFirstRecursion = (treeData, params) => {
  params = {
    sortCodeName: params && params.sortCodeName ? params.sortCodeName : "sortCode",
    parentName: params && params.parentName ? params.parentName : "parent",
    childrenName: params && params.childrenName ? params.childrenName : "children",
  };
  let childrenNodes = [],
    children = params.childrenName,
    nodes = treeData;
  for (let item in treeData) {
    if (treeData[item][children]) {
      let temp = treeData[item][children];
      childrenNodes = childrenNodes.concat(temp);
    }
  }
  if (childrenNodes.length > 0) {
    nodes = nodes.concat(breadthFirstRecursion(childrenNodes, params));
  }
  return nodes;
};
