const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
  .option('-p, --path <path>', '设置文件夹路径')
  .parse(process.argv);

const options = program.opts();



// const folderPath = options.path;

// fs.readdir(folderPath, (err, files) => {
//   if (err && err.code !== 'ENOENT') {
//     console.error('读取文件夹出错:', err);
//     return;
//   }

//   files.forEach(file => {
//     const filePath = path.join(folderPath, file);
//     fs.rmSync(folderPath, { recursive: true });

//     fs.unlink(filePath, err => {
//       if (err) {
//         console.error('删除文件出错:', err);
//         return;
//       }
//       console.log(`删除文件: ${file}`);
//     });
//   });
// });
const recursiveDelete = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const currentPath = `${path}/${file}`;

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
