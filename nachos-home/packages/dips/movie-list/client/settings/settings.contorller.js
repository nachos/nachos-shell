'use strict';

angular.module('movieListSettingsApp')
  .controller('SettingsController', function ($scope, $timeout) {
    nachosApi.getSettings(function(err, config){
      if(err){
        throw new Error(err);
      }

      $timeout(function () {
        $scope.config = config;
      });
    });

    $scope.fileChanged = function (ele) {
      $timeout(function () {
        $scope.config.directory = ele.files[0].path;
      });
    }
  });
