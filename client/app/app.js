'use strict';

angular.module('shellApp', ['ngMaterial', 'gridster', 'angularMoment'])
  .config(function(){

  })
  .run(function(nativeApi){
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
    var parentProcessId = rendererProcess.parentProcessID;
    console.log(parentProcessId);

    //var win = _.findWhere(windows, { process: { name: 'nw.exe' } });
    //console.log(win);
    //console.log(nativeApi.window.disableZIndexChange(win.handle));
  });