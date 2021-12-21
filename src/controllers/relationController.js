const { getFile, saveFile } = require('./fileController');

module.exports.addRelation = (collectionName, documentPayload, socket) => {
  const documentKeys = Object.keys(documentPayload);
  if (documentKeys.length != 1) {
    console.log('ERROR: Relate one field at each request');
    socket.write('ERROR: Relate one field at each request\r\n');
    return;
  }

  const fileContent = getFile(collectionName);
  const parsedFileContent = JSON.parse(fileContent);
  parsedFileContent.relations = {
    ...parsedFileContent.relations,
    ...documentPayload,
  };

  saveFile(collectionName, JSON.stringify(parsedFileContent));
  console.log('Added relations');
  socket.write('Added relation.\r\n');
};
