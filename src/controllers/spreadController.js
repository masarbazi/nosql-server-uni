const operationInterfaceController = require('./dbOperationController');

module.exports.spread = (query, response) => {
  const selectorRegex = /^[0-9a-zA-Z]+$/;
  console.log('query', query);
  const selector = query.substring(0, query.indexOf('.'));
  console.log('selector', selector);
  if (!selector || !selector.match(selectorRegex)) {
    console.log('Selector validation failed');
    response('Validation Failed');
    return null;
  }

  if (selector == 'db') {
    // database operation
    return { queryHandler: operationInterfaceController.getArguments };
  }
};
