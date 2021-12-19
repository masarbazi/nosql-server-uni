module.exports.validateQuery = (query, response) => {
  const collectionNameRegex = /^[0-9a-zA-Z]+$/;
  const collectionName = query.substring(0, query.indexOf(':')).trim();
  if (!collectionName || !collectionName.match(collectionNameRegex)) {
    console.log('Error: Collection name is not valid');
    return null;
  }
  const payload = query.substring(query.indexOf(':')).trim();
  if (!payload) {
    console.log('Payload is not defined');
    return null;
  }

  return { collectionName, queryPayload: payload };
};
