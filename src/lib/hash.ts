export const hash = (string: string) => {
  let hash = 0;
  Array.from(
    { length: string.length },
    (_, i) => (hash = (Math.imul(31, hash) + string.charCodeAt(i)) | 0)
  );
  return hash;
};
