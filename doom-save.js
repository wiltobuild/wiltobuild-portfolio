export const DOOM_SAVE_KEY = "wil95.doom-save.v1";
export function encodeSave(bytes, meta) {
  return JSON.stringify({
    version: 1,
    ...meta,
    data: btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join("")),
  });
}
export function decodeSave(value) {
  try {
    const saved = JSON.parse(value);
    if (
      saved.version !== 1 ||
      typeof saved.data !== "string" ||
      !Number.isInteger(saved.map) ||
      saved.map < 1 ||
      saved.map > 9 ||
      !Number.isInteger(saved.skill) ||
      saved.skill < 1 ||
      saved.skill > 5
    )
      return null;
    const bytes = Uint8Array.from(atob(saved.data), (c) => c.charCodeAt(0));
    if (bytes.length < 50 || bytes.length > 300000 || bytes.at(-1) !== 0x1d)
      return null;
    return { ...saved, bytes };
  } catch {
    return null;
  }
}
