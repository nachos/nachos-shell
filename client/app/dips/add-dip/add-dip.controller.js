'use strict';

angular.module('shellApp')
  .controller('AddDipController', function($scope, $mdDialog) {
    var nachosApi = require('nachos-api');
    var path = require('path');
    var uuid = require('node-uuid');

    nachosApi.packages.getByType('dips', true, function (err, dips) {
      $scope.widgets = dips;
    });

    $scope.add = function (widget) {
      widget.id = uuid.v4();
      widget.path = path.join(widget.path, widget.config.main);
      $mdDialog.hide(widget);
    }
  });
