import { exists, writeTextFile, readTextFile, createDir, BaseDirectory } from "@tauri-apps/api/fs";

const baseDirectory = BaseDirectory.Document;
const pmPrefix = "PingMonitor";

const getDirectory = async (name: string = pmPrefix) => {
  if(!(await exists(name, {dir: baseDirectory}))) {
    await createDir(name, {
      dir: baseDirectory,
      recursive: true
    });
  }
  return name;
};
export const writeFile = async (name: string, newContent: string, append = false) => {
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
  }catch (e) {
    console.log(e);
  }
};

export const readFile = async (name: string) => {
  const path = `${pmPrefix}\\${name}`;
  if(!(await exists(path, {dir: baseDirectory}))) {
    return null;
  }
  return await readTextFile(path, {dir: baseDirectory});
};