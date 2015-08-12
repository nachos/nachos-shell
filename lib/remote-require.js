'use strict';

var relative = require('require-relative');

module.exports = function (pkg, dipPath) {
  return relative(pkg, dipPath);
};
