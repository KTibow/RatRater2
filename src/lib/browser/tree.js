export const sortTree = (tree) =>
  Object.entries(tree).sort((a, b) => {
    if (a[1] == 0) return 1;
    if (b[1] == 0) return -1;
    return a[0].localeCompare(b[0]);
  });
export const getFileTree = (files) => {
  return files.reduce((tree, file) => {
    let current = tree;
    const parts = file.split("/");
    parts.forEach((part, i) => {
      if (!part) return;
      if (i == parts.length - 1) current[part] = 0;
      current = current[part] == null ? (current[part] = {}) : current[part];
    });
    return tree;
  }, {});
};
