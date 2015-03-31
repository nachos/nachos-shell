'use strict';

angular.module('shellApp')
  .controller('DipsController', function($scope, dips, grid) {
    $scope.dips = [];

    $scope.grid = grid;

    dips.getDips().then(function (dips) {
      $scope.dips = dips;
    })
  });
