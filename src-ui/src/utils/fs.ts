import { exists, writeTextFile, readTextFile, createDir, BaseDirectory, readDir } from "@tauri-apps/api/fs";
import { type } from "@tauri-apps/api/os";
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
  const separator = await type() === "Windows_NT" ? "\\" : "/";
  const path = `${(await getDirectory())}${separator}${name}`;
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
  const separator = await type() === "Windows_NT" ? "\\" : "/";
  const path = `${pmPrefix}${separator}${name}`;
  if(!(await exists(path, {dir: BaseDirectory.Document}))) {
    return null;
  }
  return await readTextFile(path, {dir: baseDirectory});
};

export const readFolderItems = async (name: string) => {
  const separator = await type() === "Windows_NT" ? "\\" : "/";
  const path = `${pmPrefix}${separator}${name}`;
  const entries = await readDir(path, {dir: baseDirectory});
  return entries;
};