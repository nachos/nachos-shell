'use strict';

angular.module('shellApp')
  .controller('AddDipController', function($scope, $mdDialog, workspaces) {
    // Shouldn't be workspace - should turn to nachos-api to figure out which dips are installed
    workspaces.getWidgets(function (err, widgets) {
      $scope.widgets = widgets;
      $scope.$apply();
    });

    $scope.add = function (widget) {
      delete widget.col;
      delete widget.row;
      $mdDialog.hide(widget);
    }
  });
