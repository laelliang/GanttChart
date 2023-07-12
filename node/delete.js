const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
  .option('-p, --path <path>', '设置文件夹路径')
  .parse(process.argv);

const options = program.opts();

const recursiveDelete = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const currentPath = `${path}\\${file.replace('\/', '\\')}`;

      if (fs.lstatSync(currentPath).isDirectory()) {
        recursiveDelete(currentPath);
      } else {
        fs.unlinkSync(currentPath);
        console.log(`删除文件: ${currentPath}`);
      }
    });

    if (options.path !== path) {
      fs.rmdirSync(path);
      console.log(`删除文件夹: ${path}`);
    }
  }
}
recursiveDelete(options.path)
