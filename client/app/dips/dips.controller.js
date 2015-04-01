'use strict';

angular.module('shellApp')
  .controller('DipsController', function ($scope, $mdDialog, dips, grid) {
    $scope.dips = [];

    $scope.grid = grid;

    dips.getDips().then(function (dips) {
      $scope.dips = dips;
    });

    $scope.addDip = function (ev) {
      $mdDialog.show({
        controller: 'AddDipController',
        templateUrl: 'app/dips/add-dip/add-dip.html',
        targetEvent: ev
      })
        .then(function (dip) {
          $scope.dips.push(dip);
        });
    }
  });
