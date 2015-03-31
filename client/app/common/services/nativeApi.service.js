'use strict';

angular.module('shellApp')
  .service('nativeApi', function() {
    var nativeApi = require('native-api');
    var _ = require('lodash');

    var windows = nativeApi.window.getAllWindows();
    var processes = nativeApi.process.getAllProcesses().processes;


    _.forEach(windows, function(window) {
      window.process = _.findWhere(processes, { processID: window.processID });

    });

    this.windows = windows;
  });