const rd = require('react-docgen');
const glob = require('glob');
const fs = require('fs');
const resolver = require('./resolver/findExportDefinition');
const handler = require('./handler/tsHandler');

function genProps(path) {
  const FILES = glob.sync(path);
  const results = {};
  FILES.forEach(filepath => {
    const src = fs.readFileSync(filepath);
    try {
      const propsInfoArr = rd.parse(src.toString(), resolver, [handler]);
      if (propsInfoArr && propsInfoArr.length) {
        propsInfoArr.forEach(prop => {
          if (prop && prop.name) {
            results[prop.name] = prop;
          }
        });
      }
    } catch(exception) {
      console.log(filepath + ' with exception: ' + exception);
    }
  });
  return results;
}


module.exports = {
  genProps
};