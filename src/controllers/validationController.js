module.exports.validateQuery = (query, response) => {
  const collectionNameRegex = /^[0-9a-zA-Z]+$/;
  const collectionName = query.substring(0, query.indexOf(':')).trim();
  if (!collectionName || !collectionName.match(collectionNameRegex)) {
    console.log('Collection name is not valid');
    response('Collection name is not valid');
    return null;
  }
  const payloadStr = query.substring(query.indexOf(':') + 1).trim();
  if (!payloadStr) {
    console.log('Payload is not defined');
    response('Payload is not defined');
    return null;
  }
  console.log('payLoad string', payloadStr);
  const payloadJson = JSON.parse(payloadStr);
  return { collectionName, documentPayload: payloadJson };
};
