'use strict';

angular.module('shellApp')
  .controller('DipsController', function ($scope, $mdDialog, $rootScope, grid, workspaces, nachosApi) {
    var path = require('path');
    var _ = require('lodash');

    $scope.dips = [];

    $scope.grid = grid;

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

    $rootScope.$on('refreshWorkspace', function () {
      renderWidgets();
    });

    $scope.openWidgetSettings = function (widget) {
      // Open this particular dip in the nachos-settings
    };

    function renderWidgets() {
      workspaces.getWidgets(function (err, widgets) {
        _.forEach(widgets, function (widget) {
          widget.content = getIframeContent(widget);
        });

        $scope.widgets = widgets;
        $scope.$apply();
      });
    }

     function getIframeContent(widget){
      return {
        require: require('relative-require')(widget.src),
        nachosApi: require('nachos-api')
      };
    }

    renderWidgets();
  });
