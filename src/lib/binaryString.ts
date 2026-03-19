export const arrayBufferToBinaryString = (data: ArrayBuffer) => {
  const bytes = new Uint8Array(data);
  let result = "";

  for (let i = 0; i < bytes.length; i += 0x8000) {
    result += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }

  return result;
};
