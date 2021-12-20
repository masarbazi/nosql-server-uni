const _ = require('lodash');

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
