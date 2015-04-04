'use strict';

angular.module('shellApp')
  .service('nativeApi', function() {
    return require('native-api');
  });