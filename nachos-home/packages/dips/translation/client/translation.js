'use strict';

angular.module('translationApp')
  .controller('TranslationController', function ($scope, $timeout) {
    var translate = require('yandex-translate');

    $scope.first = "Hello";

    $scope.translateFirst = function () {
      var options = {
        to: 'he',
        key: 'trnsl.1.1.20150419T222316Z.cf6638eb8c19da96.b671abcd444bd75e9cb1046d16961209a227ca22'
      };
      translate($scope.first, options, function (err, res) {
          $timeout(function () {
            $scope.second = res.text;
          });
        });
    };

    $scope.translateSecond = function () {
      var options = {
        to: 'en',
        key: 'trnsl.1.1.20150419T222316Z.cf6638eb8c19da96.b671abcd444bd75e9cb1046d16961209a227ca22'
      };
      translate($scope.second, options, function (err, res) {
          $timeout(function () {
            $scope.first = res.text;
          });
        });
    };

    $scope.translateFirst();

    $scope.open = function () {
      var path = 'https://translate.google.com/?q=' + $scope.source + '&sl=en&tl=he';
      console.log(path);
      nachosApi.fs.open(path);
    };
  });
