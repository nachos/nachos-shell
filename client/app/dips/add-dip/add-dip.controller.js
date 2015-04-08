'use strict';

angular.module('shellApp')
  .controller('AddDipController', function($scope, $mdDialog, workspaces) {
    // Shouldn't be workspace - should turn to nachos-api to figure out which dips are installed
    workspaces.getDips().then(function (dips) {
      $scope.dips = dips;
    });

    $scope.add = function (dip) {
      delete dip.col;
      delete dip.row;
      $mdDialog.hide(dip);
    }
  });
