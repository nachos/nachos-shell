'use strict';

angular.module('shellApp')
  .service('workspaces', function ($log, $rootScope, settings) {
    var self = this;
    var _ = require('lodash');
    var async = require('async');
    var path = require('path');
    var uuid = require('node-uuid');
    var Packages = require('nachos-packages');
    var packages = new Packages();

    var activeWorkspace;

    function setDefaultWorkspace() {
      settings.get(function (err, config) {
        if (err) {
          callback(err);
          return $log.log(err);
        }

        if (_.isEmpty(config.workspaces)) {
          self.createWorkspace('home');
        }
      });

    }

    var getGridItem = function (dipConfig, dipLayout) {
      return {
        id: dipLayout.id,
        name: dipConfig.config.name,
        path: path.resolve(dipConfig.path, dipConfig.config.main),
        sizeX: dipLayout.layout.width,
        sizeY: dipLayout.layout.height,
        row: dipLayout.layout.y,
        col: dipLayout.layout.x
      };
    };

    var createLayoutFromItem = function (gridItem) {
      return {
        id: gridItem.id,
        path: gridItem.path,
        name: gridItem.name,
        layout: {
          width: gridItem.sizeX,
          height: gridItem.sizeY,
          y: gridItem.row,
          x: gridItem.col
        }
      };
    };

    var updateLayoutFromItem = function (gridItem, dipLayout) {
      dipLayout.layout = {
        width: gridItem.sizeX,
        height: gridItem.sizeY,
        y: gridItem.row,
        x: gridItem.col
      };
    };

    var updateWorkspace = function (id, workspace, updateAll) {
      activeWorkspace = {id: id, workspace: workspace};
      $rootScope.$emit('refreshWorkspace');

      if (updateAll) {
        // use nachos api to notify about workspace change
      }
    };

    var getActiveWorkspace = function (callback) {
      settings.get(function (err, config) {
        if (err) {
          callback(err);
          return $log.log(err);
        }

        var last = config.lastWorkspace || Object.keys(config.workspaces)[0];
        if (!last) {
          return setDefaultWorkspace();
        }
        var active = config.workspaces[last];
        return callback(null, {id: last, workspace: active});
      });
    };

    var getWorkspaceDips = function (workspace, callback) {
      async.map(workspace.dips, function (dipLayout, callback) {
        packages.getDip(dipLayout.name, function (err, dipConfig) {
          if (err) {
            callback(null, null);
            return $log.log('error loading dip %s - %s', dipLayout.name, err);
          }

          var gridItem = getGridItem(dipConfig, dipLayout);

          callback(null, gridItem);
        });
      }, function (err, dips) {
        var filtered = _.filter(dips, function (dip) {
          return !!dip;
        });

        callback(null, filtered);
      });
    };

    this.addNewDip = function (dip) {
      // Find a better way to assign dip ids
      self.saveDipLayout(dip);
    };

    this.saveDipLayout = function (gridItem) {
      settings.get(function (err, config) {
        if (err) {
          return $log.log(err);
        }

        var dipLayout = _.findWhere(activeWorkspace.workspace.dips, {id: gridItem.id});

        if (!dipLayout) {
          dipLayout = createLayoutFromItem(gridItem);
          activeWorkspace.workspace.dips.push(dipLayout);
        } else {
          updateLayoutFromItem(gridItem, dipLayout);
        }

        config.workspaces[activeWorkspace.id] = activeWorkspace.workspace;
        settings.save(config, function (err) {
          if (err) {
            $log.log(err);
          }
        });
      });
    };

    this.getWorkspacesMeta = function (callback) {
      settings.get(function (err, config) {
        if (err) {
          callback(err);
          return $log.log(err);
        }

        var meta = _.mapValues(config.workspaces, function (workspace) {
          return workspace.name;
        });

        callback(null, meta);
      });
    };

    this.getDips = function (callback) {
      if (activeWorkspace) {
        getWorkspaceDips(activeWorkspace.workspace, callback);
      } else {
        getActiveWorkspace(function (err, workspace) {
          if (err) {
            callback(err);
            return $log.log(err);
          }

          activeWorkspace = workspace;
          getWorkspaceDips(activeWorkspace.workspace, callback);
        });
      }
    };

    this.changeWorkspace = function (id) {
      settings.get(function (err, config) {
        if (err) {
          return console.log(err);
        }

        var workspace = config.workspaces[id];
        if (!workspace) {
          $log.error('No such workspace ' + id);
        }
        else if (activeWorkspace.id != id) {
          config.lastWorkspace = id;
          settings.save(config, function (err) {
            if (err) {
              return console.log(err);
            }

            updateWorkspace(id, workspace, true);
          });
        }
      });
    };

    this.createWorkspace = function (name) {
      var structure = {
        workspaces: {}
      };

      var id = uuid.v4();
      var workspace = {
        name: name,
        dips: []
      };
      structure.workspaces[id] = workspace;


      settings.set(structure, function (err) {
        if (err) {
          console.log(err);
        }

        updateWorkspace(id, workspace);

        self.getWorkspacesMeta(self.nofifyChanges);
      })
    };

    this.registerChanges = function (cb) {
      self.nofifyChanges = cb;
    }
  });