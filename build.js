const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filePath = './nconfig.json';
let configData
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  configData = JSON.parse(fileContent);
} catch (error) {
  console.error('读取 JSON 文件时出错:', error);
}

configData.outDir = path.join(__dirname, configData.outDir)
configData.src = path.join(__dirname, configData.src)


// 清空文件
const deleteOut = execSync(`node ./node/delete.js -p ${configData.outDir}`)
console.log(deleteOut.toString('utf8'))


// 编译
const buildOut = execSync(`cd ${__dirname} && tspc -p tsconfig.json`)
console.log(buildOut.toString('utf8'))

// 复制文件
const moveOut = execSync(`node ./node/move.js -s ${configData.src} -t ${configData.outDir}`)
console.log(moveOut.toString('utf8'))



