import { exists, writeTextFile, readTextFile, createDir, BaseDirectory, readDir } from "@tauri-apps/api/fs";

const baseDirectory = BaseDirectory.Document;
const pmPrefix = "PingMonitor 1.5.0";

const getDirectory = async (name: string = pmPrefix) => {
  if(!(await exists(name, {dir: baseDirectory}))) {
    await createDir(name, {
      dir: baseDirectory,
      recursive: true
    });
  }
  return name;
};
export const writeFile: (name: string, newContent: string, append?:boolean) => Promise<boolean> = async (name, newContent, append = false) => {
  const path = `${(await getDirectory())}\\${name}`;
  let oldContent = "";
  if (append) {
    if((await exists(path, {dir: baseDirectory}))) {
      oldContent = await readTextFile(path, {dir: baseDirectory}) || "";
    }
  }
  const content = oldContent + newContent;
  try{
    await writeTextFile(path, content, {dir: baseDirectory});
    return true;
  }catch (e) {
    console.log(e);
  }
  return false;
};

export const readFile = async (name: string) => {
  const path = `${pmPrefix}\\${name}`;
  if(!(await exists(path, {dir: baseDirectory}))) {
    return null;
  }
  return await readTextFile(path, {dir: baseDirectory});
};

export const readFolderItems = async (name: string) => {
  const path = `${pmPrefix}\\${name}`;
  const entries = await readDir(path, {dir: baseDirectory});
  return entries;
};