'use strict';

angular.module('shellApp')
  .controller('AddDip', function ($scope, $mdDialog) {
    var packages = require('nachos-packages');

    packages.getByType('dip', true)
      .then(function (dips) {
        $scope.dips = dips;
      });

    $scope.add = function (dip) {
      $mdDialog.hide(dip);
    }
  });
