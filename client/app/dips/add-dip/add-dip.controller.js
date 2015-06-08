'use strict';

angular.module('shellApp')
  .controller('AddDipController', function($scope, $mdDialog) {
    var Packages = require('nachos-packages');
    var path = require('path');
    var uuid = require('node-uuid');

    var packages = new Packages();

    packages.getByType('dip', true, function (err, dips) {
      $scope.widgets = dips;
    });

    $scope.add = function (widget) {
      widget.id = uuid.v4();
      widget.path = path.join(widget.path, widget.config.main);
      $mdDialog.hide(widget);
    }
  });
