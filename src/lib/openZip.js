import JSZip from "jszip";

export const loadFile = (file) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      const data = e.target.result;
      let zip;
      try {
        zip = await new JSZip().loadAsync(data);
        resolve(zip);
      } catch (e) {
        reject(e);
      }
    };
  });
};
