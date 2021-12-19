module.exports.getArguments = (query, response) => {
  /**
   * will return operation and operation payload
   * db.create("user: {name: "Ali"}")
   * operation: create, payload: user: {name: "Ali"}
   */
  const operationRegex = /^[a-zA-z]/;
  const operation = query.substring(3, query.indexOf('('));
  if (!operation || !operation.match(operationRegex)) {
    console.log('Operation validation failed');
    response('Validation Failed');
    return null;
  }
  const queryPayload = query.substring(
    query.indexOf('(') + 2,
    query.lastIndexOf(')') - 1
  );
  if (!queryPayload) {
    console.log('Operation argument validation failed');
    response('Validation Failed');
    return null;
  }

  console.log('operation', operation);
  console.log('payload', queryPayload);
  // return { operation, queryPayload };
}; // end getArguments
