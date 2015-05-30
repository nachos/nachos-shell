'use strict';

angular.module('movieListApp')
  .controller('Settings', function ($scope, $timeout, $mdToast, $state) {
    dipApi.get(function (err, config) {
      if(err){
        notify(err);
      }

      $timeout(function () {
        $scope.config = config;
      });
    });

    dipApi.onInstanceChange(function (config) {
      $timeout(function () {
        $timeout(function () {
          $scope.config = config;
        });
      });
    });

    $scope.fileChanged = function (ele) {
      $timeout(function () {
        $scope.config.instance.directory = ele.files[0].path;
      });
    };

    $scope.save = function () {
      dipApi.save($scope.config, function (err) {
        if(err){
          notify(err);
        }

        notify('Changes saved!');

        $state.go('main');
      });
    };

    function notify (msg) {
      $mdToast.show(
        $mdToast.simple()
          .content(msg)
          .position('bottom right')
      );
    }
  });
