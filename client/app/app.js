'use strict';

angular.module('shellApp', ['ngMaterial', 'gridster', 'angularMoment', 'iframeWrapper'])
  .run(function(){
    var nativeApi = require('native-api');
    var _ = require('lodash');

    var windows = nativeApi.window.getAllWindows();
    //console.log(windows);

    // Both should return the renderer process
    //console.log(nativeApi.window.getCurrentWindow().processID);
    //console.log(process.pid);

    // Get all the processes and look for the renderer process
    var processes = nativeApi.process.getAllProcesses().processes;

    /*
    var nwprocesses = _.filter(processes, function (process) {
      return process.name === 'nw.exe';
    });
    console.log(nwprocesses);*/

    // look for the process of the renderer
    var rendererProcess = _.filter(processes, function (proc) {
      return proc.processID === process.pid;
    });
    var parentProcessId = rendererProcess[0].parentProcessID;

    var win = _.findWhere(windows, { processID: parentProcessId });
    //console.log(nativeApi.window.disableZIndexChange(win.handle));
  });