'use strict';

angular.module('shellApp')
  .service('windows', function ($interval) {
    var nativeApi = require('native-api');
    var _ = require('lodash');

    var get = function() {
      var windows = nativeApi.window.getAllWindows();

      var processes = nativeApi.process.getAllProcesses().processes;
      _.forEach(windows, function (window) {
        window.process = _.findWhere(processes, {processID: window.processID});

      });

      return windows;
    };

    var windows = get();

    // TODO: Listen to windows event of 'windows changed' then fetch all windows and notify

    this.getAll = function () {
      return windows;
    };
  });