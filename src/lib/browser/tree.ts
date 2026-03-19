export type Tree = { [key: string]: Tree | 0 };
export const sortTree = (tree: Tree) =>
  // @ts-expect-error narrowing broken
  Object.entries(tree).sort((a, b) => {
    if ((a[1] == 0) == (b[1] == 0)) return a[0].localeCompare(b[0]);
    if (a[1] == 0) return 1;
    if (b[1] == 0) return -1;
  });
export const getFileTree = (files: string[]) => {
  return files.reduce((tree, file) => {
    let current = tree;
    const parts = file.split("/");
    if (file.endsWith("/") && parts.length > 1) {
      parts[parts.length - 2] += "/";
      parts.pop();
    }
    const filteredParts = parts.filter(Boolean);
    filteredParts.forEach((part, i) => {
      if (i == filteredParts.length - 1) current[part] = 0;
      // @ts-expect-error doesnt realize that current will never be 0
      current = current[part] == undefined ? (current[part] = {}) : current[part];
    });
    return tree;
  }, {} as Tree);
};
