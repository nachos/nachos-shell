'use strict';

angular.module('shellApp')
  .controller('TaskbarController', function ($scope, $interval, grid, workspaces, windows, $timeout) {
    var _ = require('lodash');
    var Q = require('q');
    var nachosApi = require('nachos-api');
    var client = nachosApi.server;
    var remote = require('remote');
    var windowsManager = remote.require('windows-manager');

    var batteryLevel = require('battery-level');
    var brightness = require('brightness');

    $scope.date = Date.now();
    $interval(function () {
      $scope.date = Date.now();
    }, 1000);

    $scope.grid = grid;

    //$scope.windows = _.groupBy(windows.getAll(), function (window) {
    //  //return window.process.name;
    //});

    $scope.windows = windows.getAll();

    var checkBattery = function () {
      Q.nfcall(batteryLevel)
        .then(function (batteryLevel) {
          $scope.batteryLevel = batteryLevel;
          $scope.batteryLevelError = false;
        })
        .catch(function (err) {
          console.log(err);
          $scope.batteryLevelError = true;
        });
    };

    checkBattery();

    $interval(function () {
      checkBattery();
    }, 10000);

    var checkbrightness = function () {
      Q.nfcall(brightness.get)
        .then(function (bright) {
          $scope.brightness = bright;
        })
        .catch(function (err) {
          console.log(err);
        });
    };

    checkbrightness();

    $interval(function () {
      checkbrightness();
    }, 300);

    workspaces.onWorkspacesChanged(function () {
      return updateWorkspaceMeta();
    });

    function updateWorkspaceMeta() {
      return workspaces.getWorkspacesMeta()
        .then(function (workspaces) {
          $scope.workspaces = workspaces;
        });
    }

    updateWorkspaceMeta();

    client.users.me()
      .then(function (user) {
        $scope.user = user;
      });

    $scope.getNumberOfWindowsClass = function (window) {
      if (window.length > 9) {
        return 'mdi-numeric-9-plus-box-multiple-outline';
      }
      else if (window.length === 1) {
        return '';
      }
      else {
        return 'mdi-numeric-' + window.length + '-box-multiple-outline'
      }
    };

    $scope.changeWorkspace = function (id) {
      workspaces.changeWorkspace(id);
    };

    $scope.windowClick = function (window) {
      windowsManager.activate(window.handle);
    };
  });