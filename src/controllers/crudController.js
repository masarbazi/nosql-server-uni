const ObjectID = require('bson').ObjectID;
const dataTemplate = require('../util/dataTemplate');
const { updateIndexing } = require('./indexingController');
const { getFile, saveFile } = require('../controllers/fileController');

module.exports.create = (collectionName, documentPayload) => {
  // collectionName: String, documentPayload: Object
  const id = new ObjectID().toString(); // document ID
  const fileContent = getFile(collectionName);
  console.log('file content\n', fileContent);
  if (!fileContent) {
    saveFile(collectionName, JSON.stringify(dataTemplate));
    return this.create(collectionName, documentPayload);
  }
  let parsedFileContent = JSON.parse(fileContent);
  parsedFileContent.data[id] = documentPayload;
  for (let indexingKey of Object.keys(parsedFileContent.indexing)) {
    // indexing exists. update indexing
    parsedFileContent = updateIndexing(indexingKey, parsedFileContent, true); // TODO: update ascending parameter
  }
  saveFile(collectionName, JSON.stringify(parsedFileContent));
}; // end create

module.exports.update = (collectionName, documentPayload) => {
  const id = documentPayload.id;
  if (!id) throw Error('Provide ID for update');
  const fileContent = getFile(collectionName);
  if (!fileContent) throw Error(`Collection ${collectionName} does not exist`);
  let parsedFileContent = JSON.parse(fileContent);
  const document = parsedFileContent.data[id];
  if (!document) throw Error(`Document with Id ${id} does not exist`);
  parsedFileContent.data[id] = { ...documentPayload };
  for (let indexingKey of Object.keys(parsedFileContent.indexing)) {
    // indexing exists. update indexing
    parsedFileContent = updateIndexing(indexingKey, parsedFileContent, true);
  }
  parsedFileContent.data[id].id = undefined;
  saveFile(collectionName, JSON.stringify(parsedFileContent));
};

module.exports.deleteDocument = (collectionName, documentPayload) => {
  const fileContent = getFile(collectionName);
  if (!fileContent) throw Error(`Collection ${collectionName} does not exist`);
  let parsedFileContent = JSON.parse(fileContent);
  for (let docId in parsedFileContent.data) {
    if (objectContains(parsedFileContent.data[docId], documentPayload)) {
      delete parsedFileContent.data[docId];
    }
  } // end for

  for (let indexingKey of Object.keys(parsedFileContent.indexing)) {
    // indexing exists. update indexing
    parsedFileContent = updateIndexing(indexingKey, parsedFileContent, true);
  }
  saveFile(collectionName, JSON.stringify(parsedFileContent));
}; // end delete

module.exports.read = (collectionName, documentPayload) => {};

const objectContains = (parent, child) => {
  let result = true;
  for (let childKey in child) {
    if (parent[childKey] != child[childKey]) {
      result = false;
      break;
    }
  }
  return result;
};
