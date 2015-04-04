'use strict';

angular.module('shellApp')
  .service('windows', function(nativeApi) {
    var _ = require('lodash');

    var windows = nativeApi.window.getAllWindows();
    var processes = nativeApi.process.getAllProcesses().processes;

    _.forEach(windows, function(window) {
      window.process = _.findWhere(processes, { processID: window.processID });

    });

    this.windows = windows;
  });