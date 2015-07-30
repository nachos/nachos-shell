'use strict';

angular.module('shellApp')
  .controller('Desktop', function ($scope, $mdDialog, grid, workspaces, $timeout) {
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
        .then(function (name) {
          workspaces.createWorkspace(name);
        });
    };

    workspaces.onActiveChanged(function () {
      renderDips();
    });

    function renderDips() {
      return workspaces.getDips()
        .then(function (dips) {
          dips.forEach(function (dip) {
            dip.content = getIframeContent(dip);
          });

          $timeout(function () {
            $scope.dips = dips;
          });
        })
        .catch(function (err) {
          console.log(err);
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
            get: function () {
              return settings.get();
            },
            save: function (config) {
              return settings.save(config);
            },
            onChange: function (callback) {
              settings.onChange(callback);
            }
          };
        },
        instance: function (instanceDefaults) {
          var instance = nachosApi.settings(dip.name)
            .instance(dip.id, { instanceDefaults: instanceDefaults });

          return {
            get: function () {
              return instance.get();
            },
            save: function (config) {
              return instance.save(config);
            },
            onChange: function (callback) {
              instance.onChange(callback);
            }
          };
        }
      };

      return {
        require: require('relative-require')(dip.path),
        dipApi: api
      };
    }

    renderDips();
  });
