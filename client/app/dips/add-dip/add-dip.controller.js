'use strict';

angular.module('shellApp')
  .controller('AddDipController', function($scope, $mdDialog, dips) {
    dips.getDips().then(function (dips) {
      $scope.dips = dips;
    });

    $scope.add = function (dip) {
      delete dip.col;
      delete dip.row;
      $mdDialog.hide(dip);
    }
  });
