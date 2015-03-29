'use strict';

angular.module('shellApp')
  .controller('TaskbarController', function($scope, $timeout){
    $scope.date = Date.now();

    var tick = function() {
      $scope.date = Date.now(); // get the current time
      $timeout(tick, 1000); // reset the timer
    };

    // Start the timer
    $timeout(tick, 1000);
  });
