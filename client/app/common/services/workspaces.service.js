'use strict';

angular.module('shellApp')
  .service('workspaces', function($log, $rootScope, nachosApi) {
    var self = this;
    var _ = require('lodash');
    var async = require('async');
    var path = require('path');
    var activeWorkspace;

    var dipToWidget = function(dip, dipSettings){
      dip.id = dipSettings.id;
      dip.name = dipSettings.name;
      dip.path = path.resolve(dip.path, dip.config.main);
      dip.sizeX = dipSettings.layout.width;
      dip.sizeY = dipSettings.layout.height;
      dip.row = dipSettings.layout.y;
      dip.col = dipSettings.layout.x;

      return dip;
    };

    var widgetToDip = function(widget, dip){
      if(!dip){
        dip = {
          id: widget.id,
          path: widget.path,
          name: widget.name,
          layout: {}
        }
      }

      dip.layout.width = widget.sizeX;
      dip.layout.height = widget.sizeY;
      dip.layout.y = widget.row;
      dip.layout.x = widget.col;

      return dip;
    };

    var updateWorkspace = function (workspace, updateAll) {
      activeWorkspace = workspace;
      $rootScope.$emit('refreshWorkspace');

      if (updateAll) {
        // use nachos api to notify about workspace change
      }
    };

    var getActiveWorkspace = function (callback) {
      self.getWorkspaces(function (err, workspaces) {
        if (err) {
          callback(err);
          return $log.log(err);
        }

        nachosApi.configs.getGlobal('shell', function (err, config) {
          if (err) {
            callback(err);
            return $log.log(err);
          }

          var active = _.findWhere(workspaces, {id: config.screens.primary});

          return callback(null, active);
        });
      });
    };

    var workspaceToDips = function (workspace, callback) {
      async.map(workspace.dips, function (dipSettings, callback) {
        nachosApi.packages.getDip(dipSettings.name, function (err, dip) {
          if (err) {
            callback(null, null);
            return $log.log('error loading dip %s - %s', dipSettings.name, err);
          }

          dipToWidget(dip, dipSettings);

          callback(null, dip);
        });
      }, function (err, dips) {
        var filtered = _.filter(dips, function (dip) {
          return !!dip;
        });

        callback(null, filtered);
      });
    };

    this.addNewWidget = function(widget){
      // Find a better way to assign dip ids
      nachosApi.configs.getGlobal('shell', function(err, config){
        if (err) {
          return $log.log(err);
        }

        var maxWorkspace = _.max(config.workspaces, function(workspace){
          return _.max(workspace.dips, 'id').id;
        });

        widget.id = _.max(maxWorkspace.dips, 'id').id + 1;
        self.saveWidgetLayout(widget);
      });
    };

    this.saveWidgetLayout = function(widget) {
      nachosApi.configs.getGlobal('shell', function (err, config) {
        if (err) {
          return $log.log(err);
        }

        var workspace = _.findWhere(config.workspaces, {id: activeWorkspace.id});
        var dip = _.findWhere(workspace.dips, { id: widget.id});
        if(!dip) {
          dip = widgetToDip(widget, dip);
          workspace.dips.push(dip);
        } else {
          widgetToDip(widget, dip);
        }

        nachosApi.configs.saveGlobal('shell', config, function(err){
          if(err) {
            $log.log(err);
          }
        });
      });
    };

    this.getWorkspaces = function(callback){
      nachosApi.configs.getGlobal('shell', function (err, config) {
        if (err) {
          callback(err);
          return $log.log(err);
        }

        callback(null, config.workspaces || []);
      });
    };

    this.getWorkspacesMeta = function (callback) {
      self.getWorkspaces(function (err, workspaces) {
        if (err) {
          callback(err);
          return $log.log(err);
        }

        var meta = _.map(workspaces, function (workspace) {
          return { id: workspace.id, name: workspace.name }
        });

        callback(null, meta);
      });
    };

    this.getWidgets = function(callback){
      if (activeWorkspace) {
        workspaceToDips(activeWorkspace, callback);
      } else {
        getActiveWorkspace(function (err, workspace) {
          if (err) {
            callback(err);
            return $log.log(err);
          }

          activeWorkspace = workspace;
          workspaceToDips(activeWorkspace, callback);
        });
      }
    };

    this.changeWorkspace = function(id) {
      self.getWorkspaces(function(err, workspaces) {
        var workspace = _.findWhere(workspaces, { 'id': id });
        if(!workspace) {
          $log.error('No such workspace ' + id);
        } else if(activeWorkspace != id) {
          updateWorkspace(workspace, true);
        }
      });
    }
});