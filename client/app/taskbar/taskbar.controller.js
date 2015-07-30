'use strict';

angular.module('shellApp')
  .controller('TaskbarController', function ($scope, $interval, grid, workspaces, windows, $timeout) {
    var _ = require('lodash');
    var nachosApi = require('nachos-api');
    var client = nachosApi.server;

    var remote = require('remote');
    var windowsManager = remote.require('windows-manager');

    $scope.date = Date.now();
    $interval(function () {
      $scope.date = Date.now();
    }, 1000);

    $scope.grid = grid;

    //$scope.windows = _.groupBy(windows.getAll(), function (window) {
    //  //return window.process.name;
    //});

    $scope.windows = windows.getAll();

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