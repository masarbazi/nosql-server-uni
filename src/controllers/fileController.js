const fs = require('fs');

module.exports.getFile = (name) => {
  const filePath = `${__dirname}/../data/${name}.json`;
  const fileExists = fs.existsSync(filePath);
  if (!fileExists) return null;
  const content = fs.readFileSync(filePath);
  return content.toString('utf-8');
};

module.exports.saveFile = (name, content) => {
  const filePath = `${__dirname}/../data/${name}.json`;
  fs.writeFileSync(filePath, content);
};

module.exports.getAllDataFilesContent = () => {
  let result = [];
  const folderPath = `${__dirname}/../data`;
  const files = fs.readdirSync(folderPath);
  for (let file of files) {
    const fileContent = fs.readFileSync(`${folderPath}/${file}`);
    const parsedFileContent = JSON.parse(fileContent);
    const collectionName = file.substring(0, file.indexOf('.'));
    result.push({ [collectionName]: parsedFileContent });
  }
  return result;
};
