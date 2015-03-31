'use strict';

angular.module('shellApp')
  .controller('TaskbarController', function($scope, $timeout, grid, nativeApi){
    $scope.date = Date.now();

    $scope.grid = grid;

    var tick = function() {
      $scope.date = Date.now(); // get the current time
      $timeout(tick, 1000); // reset the timer
    };

    // Start the timer
    $timeout(tick, 1000);

    $scope.windows = nativeApi.windows;

  });
