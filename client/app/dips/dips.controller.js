'use strict';

angular.module('shellApp')
  .controller('DipsController', function ($scope, $mdDialog, $rootScope, grid, workspaces) {
    $scope.dips = [];

    $scope.grid = grid;

    renderWidgets();

    $scope.addWidget = function (ev) {
      $mdDialog.show({
        controller: 'AddDipController',
        templateUrl: 'app/dips/add-dip/add-dip.html',
        targetEvent: ev
      })
      .then(function (widget) {
        $scope.widgets.push(widget);
        workspaces.addNewWidget(widget);
      });
    };

    $rootScope.$on('refreshWorkspace', function(){
      renderWidgets();
    });

    $scope.openWidgetSettings = function(widget){
      // Open this particular dip in the nachos-settings
    };

    function renderWidgets(){
      workspaces.getWidgets(function (err, widgets) {
        $scope.widgets = widgets;
        $scope.$apply();
      });
    }
  });
