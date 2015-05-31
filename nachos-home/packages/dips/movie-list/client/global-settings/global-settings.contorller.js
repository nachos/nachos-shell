'use strict';

angular.module('movieListSettingsApp')
  .controller('SettingsController', function ($scope, $timeout, $mdToast) {
    nachosApi.getSettings(function(err, config){
      if(err){
        notify(err);
      }

      console.log(config);
      $timeout(function () {
        $scope.config = config;
      });
    });

    $scope.fileChanged = function (ele) {
      $timeout(function () {
        $scope.config.directory = ele.files[0].path;
      });
    };

    $scope.save = function () {
      nachosApi.saveSettings($scope.config, function (err) {
        if(err){
          notify(err);
        }

        notify('Changes saved!');
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
