'use strict';

angular.module('shellApp')
  .service('settings', function () {
    var nachosApi = require('nachos-api');

    return nachosApi.settings('shell', {
      globalDefaults: {
        "lastWorkspace": null,
        "workspaces": []
      }
    });
  });