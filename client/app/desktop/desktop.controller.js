'use strict';

angular.module('shellApp')
  .controller('Desktop', function ($scope, $mdDialog, grid, workspaces, $timeout) {
    var _ = require('lodash');

    $scope.grid = grid;

    $scope.addDip = function (ev) {
      $mdDialog.show({
        controller: 'AddDip',
        templateUrl: 'app/desktop/add-dip/add-dip.html',
        targetEvent: ev
      })
        .then(function (dip) {
          dip.content = getIframeContent(dip);
          $scope.dips.push(dip);
          workspaces.saveDipLayout(dip);
        });
    };

    $scope.addWorkspace = function (ev) {
      $mdDialog.show({
        controller: 'AddWorkspace',
        templateUrl: 'app/desktop/add-workspace/add-workspace.html',
        targetEvent: ev
      })
        .then(function(name) {
          workspaces.createWorkspace(name);
        });
    };

    workspaces.onActiveChanged(function () {
      renderDips();
    });

    function renderDips() {
      workspaces.getDips(function (err, dips) {
        _.forEach(dips, function (dip) {
          dip.content = getIframeContent(dip);
        });

        $timeout(function (){
          $scope.dips = dips;
        });
      });
    }

    function getIframeContent(dip) {
      var nachosApi = require('nachos-api');

      var api = {
        global: function (globalDefaults) {
          var settings = nachosApi.settings(dip.name, {
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
          var instance = nachosApi.settings(dip.name).instance(dip.id, {
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
      api.system = nachosApi.system;

      return {
        require: require('relative-require')(dip.path),
        dipApi: api
      };
    }

    renderDips();
  });
