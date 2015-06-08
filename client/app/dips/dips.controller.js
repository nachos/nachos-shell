'use strict';

angular.module('shellApp')
  .controller('DipsController', function ($scope, $mdDialog, $rootScope, grid, workspaces) {
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
          widget.content = getIframeContent(widget);
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

    function getIframeContent(widget) {
      var nachosApi = require('nachos-api');

      var api = {
        global: function (globalDefaults) {
          var settings = nachosApi.settings(widget.name, {
            globalDefaults: globalDefaults
          });

          return {
            get: function (callback) {
              settings.get(callback);
            },
            save: function (config, callback) {
              settings.save(config, callback);
            },
            onChange: function (callback) {
              settings.onChange(callback);
            }
          };
        },
        instance: function (instanceDefaults) {
          var instance = nachosApi.settings(widget.name).instance(widget.id, {
            instanceDefaults: instanceDefaults
          });

          return {
            get: function (callback) {
              instance.get(callback);
            },
            save: function (config, callback) {
              instance.save(config, callback);
            },
            onChange: function (callback) {
              instance.onChange(callback);
            }
          };
        }
      };

      // TODO: Remove later after nachos-api is published
      api.fs = nachosApi.fs;

      return {
        require: require('relative-require')(widget.path),
        dipApi: api
      };
    }

    renderWidgets();
  });
