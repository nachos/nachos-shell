'use strict';

angular.module('shellApp')
  .controller('DipsController', function($scope){
    var api = require('nachos-api')('shell');
    var path = require('path');

    $scope.dips = [];

    var startChanging = function(){
      $scope.isChanging = true;
    };

    var stopChanging = function(){
      $scope.isChanging = false;
    };

    // Set somehow max height and not rows
    $scope.gridsterOpts = {
      columns: 10,
      pushing: true,
      swapping: true,
      floating: false,
      maxRows: 5,
      draggable: {
        enabled: false,
        start: startChanging,
        stop: stopChanging
      },
      resizable: {
        enabled: false,
        handles: ['n', 'e', 's', 'w', 'se', 'sw'],
        start: startChanging,
        stop: stopChanging
      }
    };

    // Make async
    api.getAppConfig(function (err, config) {
      if (err) {
        return console.log(err);
      }

      // how lodash works?!
      _.forEach(config.dips || [], function (dipSettings) {
        api.dips.get(dipSettings.name, function (err, dip) {
          if (err) {
            return console.log('error loading dip %s - %s', dipSettings.name, err);
          }

          dip.path = path.resolve(dip.path, dip.config.main);
          dip.sizeX = dipSettings.layout.width;
          dip.sizeY = dipSettings.layout.height;
          dip.row = dipSettings.layout.y;
          dip.col = dipSettings.layout.x;

          $scope.dips.push(dip);
        });
      });
    });
  });
