'use strict';

angular.module('movieListApp')
  .controller('Settings', function ($scope, $timeout, $mdToast, $state) {
    $scope.config = {};

    dipApi.global.get(function (err, config) {
      if(err){
        notify(err);
      }

      $timeout(function () {
        $scope.config.global = config;
      });
    });

    dipApi.instance.get(function (err, config) {
      if(err){
        notify(err);
      }

      $timeout(function () {
        $scope.config.instance = config;
      });
    });

    dipApi.instance.onChange(function (config) {
      $timeout(function () {
        $scope.config = config;
      });
    });

    $scope.fileChanged = function (ele) {
      $timeout(function () {
        if(!$scope.config.instance) {
          $scope.config.instance = {};
        }
        $scope.config.instance.directory = ele.files[0].path;
      });
    };

    $scope.save = function () {
      dipApi.instance.save($scope.config.instance, function (err) {
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
