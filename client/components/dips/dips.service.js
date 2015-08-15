'use strict';

angular.module('shellApp')
  .service('dips', function ($log, settings, gridItem, $rootScope, $q, workspaces) {
    var _ = require('lodash');
    var path = require('path');
    var uuid = require('node-uuid');
    var packages = require('nachos-packages');
    var Q = require('Q');

    var getWorkspaceDips = function (workspace) {
      var allPromise = Q.all(_.map(workspace.dips, function (dipLayout) {
        return packages.getDip(dipLayout.name)
          .then(function (dipConfig) {
            return {
              id: dipLayout.id,
              name: dipLayout.name,
              path: dipConfig.path,
              main: path.join(dipConfig.path, dipConfig.config.main),
              type: dipConfig.config.layout,
              layout: dipLayout.layout
            };
          });
      }));

      return allPromise.then(function (dips) {
        var widgets = _.filter(dips, {type: 'widget'});
        var docks = _.filter(dips, {type: 'dock'});

        _.forEach(widgets, function (widget) {
          widget.layout = gridItem.convertToItem(widget.layout);
        });

        return {
          widgets: widgets,
          docks: docks
        };
      });
    };

    this.getCurrent = function () {
      return workspaces.getActiveWorkspace()
        .then(function (workspace) {
          return getWorkspaceDips(workspace)
        });
    };

    this.addDip = function (dipConfig) {
      return workspaces.getActiveWorkspace()
        .then(function (workspace) {
          var id = uuid.v4();
          var defaultLayout = {};

          if (dipConfig.config.layout === 'dock') {
            defaultLayout.size = 64;
          }

          workspace.dips.push({id: id, name: dipConfig.name, layout: defaultLayout});

          return workspaces.saveWorkspace(workspace)
            .then(function () {
              return {
                id: id,
                name: dipConfig.name,
                path: dipConfig.path,
                main: path.join(dipConfig.path, dipConfig.config.main),
                type: dipConfig.config.layout,
                layout: defaultLayout
              };
            });
        });
    };

    this.saveWidgetLayout = function (id, itemLayout) {
      return workspaces.getActiveWorkspace()
        .then(function (workspace) {
          var dip = _.findWhere(workspace.dips, {id: id});

          dip.layout = gridItem.convertToLayout(itemLayout);

          return workspaces.saveWorkspace(workspace);
        });
    };
  });