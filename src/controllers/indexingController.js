const _ = require('lodash');
const { getFile, saveFile } = require('./fileController');

module.exports.updateIndexing = (indexKey, collectionObj, ascending) => {
  // 1. create array of documents
  let collectionArray = [];
  const documentIds = Object.keys(collectionObj.data);
  for (let i = 0; i < documentIds.length; i++) {
    const docId = documentIds[i];
    collectionArray.push({
      id: docId,
      ...collectionObj.data[docId],
    });
  } // end for

  // 2. sort cloned collection
  collectionArray.sort((a, b) => {
    if (ascending) {
      return _.get(a, indexKey) >= _.get(b, indexKey) ? 1 : -1;
    } else {
      return _.get(a, indexKey) < _.get(b, indexKey) ? 1 : -1;
    }
  });

  // 3. based on sorted collection define indexing
  // indexKey: name.firstname
  collectionObj.indexing[indexKey] = collectionArray.map((item) => ({
    value: _.get(item, indexKey),
    document: item.id,
  }));

  return collectionObj;
};

module.exports.addIndex = (collectionName, documetnPayload, socket) => {
  const documentPayloadKeys = Object.keys(documetnPayload);
  if (documentPayloadKeys.length != 1) {
    socket.write('ERROR: Can add one index at a request');
    console.log('ERROR: Can add one index at a request');
    return;
  }

  const indexKey = documentPayloadKeys[0];
  if (documetnPayload[indexKey] != 1 && documetnPayload[indexKey] != -1) {
    socket.write('ERROR: validation error occured');
    console.log('ERROR: validation error occured');
    return;
  }

  // read collection
  const fileContent = getFile(collectionName);
  const parsedFileContent = JSON.parse(fileContent);
  if (documetnPayload[indexKey] == 1) {
    // add index
    parsedFileContent.indexing[indexKey] = [];
    this.updateIndexing(indexKey, parsedFileContent, true);
  } else {
    // remove index
    delete parsedFileContent.indexing[indexKey];
  }

  // save file
  saveFile(collectionName, JSON.stringify(parsedFileContent));
  documetnPayload[indexKey] == 1
    ? socket.write(`Indexing added to ${indexKey}.\r\n`)
    : socket.write(`Indexing removed from ${indexKey}.\r\n`);
};
