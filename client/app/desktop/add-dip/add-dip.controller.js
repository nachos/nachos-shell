'use strict';

angular.module('shellApp')
  .controller('AddDip', function ($scope, $mdDialog) {
    var packages = require('nachos-packages');
    var path = require('path');
    var uuid = require('node-uuid');

    packages.getByType('dip', true)
      .then(function (dips) {
        $scope.widgets = dips;
      });

    $scope.add = function (widget) {
      widget.id = uuid.v4();
      widget.path = path.join(widget.path, widget.config.main);
      $mdDialog.hide(widget);
    }
  });
