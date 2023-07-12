const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
  .option('-s, --source <source>', '设置源文件夹路径')
  .option('-t, --target <target>', '设置目标文件夹路径')
  .parse(process.argv);

const options = program.opts();

function copyFiles(sourceDir, destinationDir) {
  // 获取源文件夹下的所有文件
  const files = fs.readdirSync(sourceDir);

  // 逐个处理文件
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destinationPath = path.join(destinationDir, file);

    // 判断当前文件是文件还是文件夹
    const isDirectory = fs.statSync(sourcePath).isDirectory();

    if (isDirectory) {
      // 如果是文件夹，则递归复制文件夹下的所有文件
      fs.mkdirSync(destinationPath);
      copyFiles(sourcePath, destinationPath);
      console.log(`复制文件夹 ${sourcePath}`)
    } else {
      // 如果是文件，则直接复制文件到目标文件夹
      fs.copyFileSync(sourcePath, destinationPath);
      console.log(`复制文件 ${sourcePath}`)
    }
  });
}

copyFiles(options.source, options.target)
