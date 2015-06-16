'use strict';

angular.module('shellApp')
  .controller('TaskbarController', function ($scope, $interval, grid, workspaces, windows, $timeout) {
    var _ = require('lodash');
    var nativeApi = require('native-api');
    var client = require('nachos-server-api')();

    $scope.date = Date.now();
    $interval(function () {
      $scope.date = Date.now();
    }, 1000);

    $scope.grid = grid;

    $scope.windows = _.groupBy(windows.getAll(), function (window) {
      return window.process.name;
    });

    workspaces.onWorkspacesChanged(function () {
      updateWorkspaceMeta();
    });

    function updateWorkspaceMeta () {
      workspaces.getWorkspacesMeta(function (err, workspaces) {
        $timeout(function () {
          $scope.workspaces = workspaces;
        });
      });
    }

    updateWorkspaceMeta();

    client.users.me(function (err, user) {
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
      if (window.length === 1) {
        var win = window[0];
        if (nativeApi.window.isForeground(win.handle)) {
          nativeApi.window.minimize(win.handle);
        } else {// if (nativeApi.window.isMinimized(win.handle)) {
          nativeApi.window.setToForeground(win.handle);
        }
      } else {
        alert('Can\'t click, multiple processes');
      }
    };
  });
