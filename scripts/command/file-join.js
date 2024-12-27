const { readdirSync, readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

function vlaidateFiles(files) {
  const list = readdirSync(__dirname, { withFileTypes: true });
  let count = 0;
  for (let i = 0; i < list.length; i++) {
    const dirent = list[i];
    if (
      dirent.isFile() &&
      files.includes(dirent.name) &&
      ++count === files.length
    )
      return true;
  }
  return false;
}

function run({ files, prefix, postfix }) {
  if (!files.length) throw new Error("没有文件信息！");
  if (!vlaidateFiles(files)) throw new Error("文件存在缺失！");

  const file = resolve(__dirname, `${prefix}.${postfix}`);

  const bufferList = files.map((name) => 
     readFileSync(resolve(__dirname, name))
  );
  writeFileSync(file, Buffer.concat(bufferList));
}

run({})
