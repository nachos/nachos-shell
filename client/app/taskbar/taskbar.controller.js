'use strict';

angular.module('shellApp')
  .controller('TaskbarController', function($scope, $timeout, grid, nativeApi, workspaces){
    var _ = require('lodash');
    $scope.date = Date.now();
    $scope.grid = grid;

    var tick = function() {
      $scope.date = Date.now(); // get the current time
      $timeout(tick, 1000); // reset the timer
    };

    // Start the timer
    $timeout(tick, 1000);

    $scope.windows = _.groupBy(nativeApi.windows, function (window) {
      return window.process.name;
    });

    workspaces.getWorkspaces().then(function(workspaces){
      $scope.workspaces = workspaces;
    });
    $scope.getNumberOfWindowsClass = function (window) {
      if(window.length > 9){
        return 'mdi-numeric-9-plus-box-multiple-outline';
      }
      else if (window.length == 1) {
        return '';
      }
      else {
        return 'mdi-numeric-' + window.length + '-box-multiple-outline'
      }
    }

    $scope.changeWorkspace = function(id){
      workspaces.changeWorkspace(id);
    }
  });
