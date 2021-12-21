const ObjectID = require('bson').ObjectID;
const dataTemplate = require('../util/dataTemplate');
const { updateIndexing } = require('./indexingController');
const {
  getFile,
  saveFile,
  getAllDataFilesContent,
} = require('../controllers/fileController');

module.exports.create = (collectionName, documentPayload, socket) => {
  // collectionName: String, documentPayload: Object
  const id = new ObjectID().toString(); // document ID
  const fileContent = getFile(collectionName);
  // console.log('file content\n', fileContent);
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
  socket.write('Created.\r\n');
}; // end create

module.exports.update = (collectionName, documentPayload, socket) => {
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
  socket.write('Updated.\r\n');
};

module.exports.deleteDocument = (collectionName, documentPayload, socket) => {
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
  socket.write('Deleted.\r\n');
}; // end delete

module.exports.read = (collectionName, documentPayload, socket) => {
  const result = [];
  if (documentPayload == null && collectionName == null) {
    const dataFilesContent = getAllDataFilesContent(); // typeof array
    for (let fileContent of dataFilesContent) {
      for (let collectionName of Object.keys(fileContent)) {
        result.push({ [collectionName]: fileContent[collectionName].data });
      }
    }
    console.log('Returned all collections');
    socket.write(JSON.stringify(result) + '\r\n');
  }
  const fileContent = getFile(collectionName);
  if (!fileContent) throw Error(`Collection ${collectionName} does not exist`);
  const parsedFileContent = JSON.parse(fileContent);
  const indexingKeys = Object.keys(parsedFileContent.indexing);
  const documentPayloadKeys = Object.keys(documentPayload);
  if (
    documentPayloadKeys.length == 1 &&
    indexingKeys.includes(documentPayloadKeys[0])
  ) {
    // binary search for fast querying
    const searchResult = binarySearch(
      documentPayload[documentPayloadKeys[0]],
      parsedFileContent.indexing[documentPayloadKeys[0]]
    ); // {value: "...", document: ".."}
    if (searchResult) {
      const document = parsedFileContent.data[searchResult.document];
      if (document) result.push(document);
    }
  } else {
    for (let documentId of Object.keys(parsedFileContent.data)) {
      if (objectContains(parsedFileContent.data[documentId], documentPayload)) {
        result.push(parsedFileContent.data[documentId]);
      }
    }
  }

  if (parsedFileContent.relations)
    populate(result, parsedFileContent.relations);
  console.log('Result', result);
  socket.write(JSON.stringify(result) + '\r\n');
};

const populate = (documents, relations) => {
  // documents typeof array
  // relations typeof object (same structure in *.json files)
  const relationsKeys = Object.keys(relations);
  for (let document of documents) {
    const documentKeys = Object.keys(document);
    for (let docKey of documentKeys) {
      if (relationsKeys.includes(docKey)) {
        // caught relation
        const fileContent = getFile(relations[docKey]);
        const parsedFileContent = JSON.parse(fileContent);
        const relatedDocumentId = document[docKey];
        document[docKey] = parsedFileContent.data[relatedDocumentId];
      }
    }
  }
}; // end popualte

const binarySearch = (targetValue, array) => {
  // array contains collection of objects
  // property is a prop of these objects
  let low = 0,
    high = array.length;
  let mid = Math.floor((high + low) / 2);
  let result = null;

  while (mid >= low && mid < high) {
    const midItem = array[mid];
    if (midItem.value === targetValue) {
      result = midItem;
      break;
    } else if (midItem.value > targetValue) {
      mid = Math.floor((low + mid) / 2);
      continue;
    } else if (midItem.value < targetValue) {
      mid = Math.floor((high + mid) / 2);
      continue;
    }
  } // end while
  return result;
};

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
