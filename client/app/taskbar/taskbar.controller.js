'use strict';

angular.module('shellApp')
  .controller('TaskbarController', function($scope, $timeout, grid, nativeApi, workspaces, windows, nachosApi){
    var _ = require('lodash');
    $scope.date = Date.now();
    $scope.grid = grid;

    var tick = function() {
      $scope.date = Date.now(); // get the current time
      $timeout(tick, 1000); // reset the timer
    };

    // Start the timer
    $timeout(tick, 1000);

    $scope.windows = _.groupBy(windows.windows, function (window) {
      return window.process.name;
    });

    workspaces.getWorkspacesMeta(function(err, workspaces){
      $scope.workspaces = workspaces;
      $scope.$apply();
    });

    nachosApi.user.me({}, function (err, user) {
      $scope.user = user;
    });

    $scope.getNumberOfWindowsClass = function (window) {
      if(window.length > 9){
        return 'mdi-numeric-9-plus-box-multiple-outline';
      }
      else if (window.length === 1) {
        return '';
      }
      else {
        return 'mdi-numeric-' + window.length + '-box-multiple-outline'
      }
    };

	$scope.changeWorkspace = function(id){
    workspaces.changeWorkspace(id);
  };

	$scope.windowClick = function (window) {
      if (window.length === 1) {
        var win = window[0];
        if (nativeApi.window.isForeground(win.handle)) {
          nativeApi.window.minimize(win.handle);
        } else {// if (nativeApi.window.isMinimized(win.handle)) {
          nativeApi.window.setToForeground(win.handle);
        }
      } else {
        alert('Can\'t click, multiple processes');
      }
    };
  });
