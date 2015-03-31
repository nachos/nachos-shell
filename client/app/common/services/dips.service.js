'use strict';

angular.module('shellApp')
  .service('dips', function(nachosApi, $q) {
    var path = require('path');
    var _ = require('lodash');

    this.getDips = function () {
      var deferred = $q.defer();

      // Make async
      nachosApi.getAppConfig(function (err, config) {
        if (err) {
          deferred.reject(err);
          return console.log(err);
        }

        var dips = [];

        _.forEach(config.dips || [], function (dipSettings) {
          nachosApi.dips.get(dipSettings.name, function (err, dip) {
            if (err) {
              deferred.reject(err);
              return console.log('error loading dip %s - %s', dipSettings.name, err);
            }

            dip.path = path.resolve(dip.path, dip.config.main);
            dip.sizeX = dipSettings.layout.width;
            dip.sizeY = dipSettings.layout.height;
            dip.row = dipSettings.layout.y;
            dip.col = dipSettings.layout.x;

            dips.push(dip);
          });
        });

        deferred.resolve(dips);
      });

      return deferred.promise;
    }
  });