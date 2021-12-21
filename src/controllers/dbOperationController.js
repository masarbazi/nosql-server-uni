const { validateQuery } = require('./validationController');
const { create, update, deleteDocument, read } = require('./crudController');

module.exports.getArguments = (query, socket) => {
  /**
   * will return operation and operation payload
   * db.create("user: {name: "Ali"}")
   * operation: create, payload: user: {name: "Ali"}
   */
  const operationRegex = /^[a-zA-z]/;
  const operation = query.substring(3, query.indexOf('('));
  if (!operation || !operation.match(operationRegex)) {
    console.log('Operation validation failed');
    socket.write('Validation Failed');
    return null;
  }
  const queryPayload = query.substring(
    query.indexOf('(') + 2,
    query.lastIndexOf(')') - 1
  );

  console.log('operation', operation);
  // console.log('payload', queryPayload);
  const { collectionName, documentPayload } =
    queryPayload == ''
      ? { collectionName: null, documentPayload: null } // this type is used to query all data or delete all collections
      : validateQuery(queryPayload);
  console.log('collectionName', collectionName);
  console.log('document payload', documentPayload);

  if (operation == 'create') {
    create(collectionName, documentPayload, socket);
  } else if (operation == 'update') {
    update(collectionName, documentPayload, socket);
  } else if (operation == 'delete') {
    deleteDocument(collectionName, documentPayload, socket);
  } else if (operation == 'find') {
    read(collectionName, documentPayload, socket);
  }
}; // end getArguments
