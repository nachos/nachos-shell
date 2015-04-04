'use strict';

angular.module('shellApp')
  .controller('DipsController', function ($scope, $mdDialog, grid, workspaces) {
    $scope.dips = [];

    $scope.grid = grid;

    renderDips();

    workspaces.registerScope($scope);

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
    $scope.$on('refreshWorkspace', function(){
      renderDips();
    });

    function renderDips(){
      workspaces.getDips().then(function (dips) {
        $scope.dips = dips;
      });
    }
  });
