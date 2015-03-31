'use strict';

angular.module('shellApp')
  .service('nachosApi', function() {
    return require('nachos-api')('shell');
  });