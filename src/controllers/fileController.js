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
