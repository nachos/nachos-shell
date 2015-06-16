'use strict';

angular.module('shellApp')
  .service('workspaces', function ($log, settings, gridItem, $rootScope) {
    var self = this;
    var _ = require('lodash');
    var async = require('async');
    var path = require('path');
    var uuid = require('node-uuid');
    var nachosApi = require('nachos-api');
    var Packages = require('nachos-packages');
    var packages = new Packages();

    function wrap(cb) {
      return function (event, args) {
        cb(args);
      }
    }

    function on(name, cb) {
      nachosApi.on(name, cb);
      var destroyScope = $rootScope.$on(name, wrap(cb));

      return function () {
        nachosApi.removeListener(name, cb);
        destroyScope();
      }
    }

    function emit(name, data, remoteOnly) {
      nachosApi.emit(name, data);

      if (!remoteOnly) {
        $rootScope.$broadcast(name, data);
      }
    }

    function getActiveWorkspace(callback) {
      settings.get(function (err, config) {
        if (err) {
          callback(err);
          return $log.log(err);
        }

        if (_.isEmpty(config.workspaces)) {
          return self.createWorkspace('home', function (err, activeWorkspace) {
            if (err) {
              return callback(err);
            }

            setActiveWorkspace(activeWorkspace.id, callback);
          });
        }

        var id = config.workspaces[config.lastWorkspace] ? config.lastWorkspace : Object.keys(config.workspaces)[0];
        callback(null, { id: id, workspace: config.workspaces[id] });
      });
    }

    function setActiveWorkspace(id, cb) {
      cb = cb || _.noop;

      settings.set({ lastWorkspace: id }, function (err) {
        if (err) {
          return console.log(err);
        }

        emit('shell.workspaces.active-changed', id);
        cb();
      });
    }

    function getWorkspaceDips(workspace, callback) {
      async.map(workspace.dips, function (dipLayout, callback) {
        packages.getDip(dipLayout.name, function (err, dipConfig) {
          if (err) {
            callback();
            return $log.log('error loading dip %s - %s', dipLayout.name, err);
          }

          var item = gridItem.createItem(dipConfig, dipLayout);

          callback(null, item);
        });
      }, function (err, dips) {
        var filtered = _.filter(dips, function (dip) {
          return !!dip;
        });

        callback(null, filtered);
      });
    }

    this.saveDipLayout = function (item) {
      settings.get(function (err, config) {
        if (err) {
          return $log.log(err);
        }

        getActiveWorkspace(function (err, activeWorkspace) {
          if (err) {
            return console.log(err);
          }

          var dipLayout = _.findWhere(activeWorkspace.workspace.dips, {id: item.id});

          if (!dipLayout) {
            dipLayout = gridItem.createLayoutFromItem(item);
            activeWorkspace.workspace.dips.push(dipLayout);
          } else {
            dipLayout.layout =  gridItem.getLayoutFromItem(item);
          }

          config.workspaces[activeWorkspace.id] = activeWorkspace.workspace;
          settings.save(config, function (err) {
            if (err) {
              $log.log(err);
            }

            emit('shell.workspaces.updated:' + activeWorkspace.id, null, true);
          });
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
      getActiveWorkspace(function (err, activeWorkspace) {
        if (err) {
          callback(err);
          return $log.log(err);
        }

        getWorkspaceDips(activeWorkspace.workspace, callback);
      });
    };

    this.changeWorkspace = function (id) {
      settings.get(function (err, config) {
        if (err) {
          return console.log(err);
        }

        var workspace = config.workspaces[id];
        if (!workspace) {
          $log.error('No such workspace ' + id);
        } else {
          getActiveWorkspace(function (err, activeWorkspace) {
            if (err) {
              return console.log(err);
            }

            if (activeWorkspace.id != id) {
              setActiveWorkspace(id);
            }
          });
        }
      });
    };

    this.createWorkspace = function (name, cb) {
      cb = cb || _.noop;

      var id = uuid.v4();

      var newSettings = {
        workspaces: {}
      };

      newSettings.workspaces[id] = {
        name: name,
        dips: []
      };

      settings.set(newSettings, function (err) {
        if (err) {
          return cb(err);
        }

        emit('shell.workspaces.created', id);
        setActiveWorkspace(id, function (err) {
          if (err) {
            return cb(err);
          }

          cb(null, { id: id, workspace: newSettings.workspaces[id] });
        });
      })
    };

    this.onWorkspacesChanged = function (cb) {
      on('shell.workspaces.created', cb);
      on('shell.workspaces.updated', cb);
    };

    this.onActiveChanged = function (cb) {
      getActiveWorkspace(function (err, activeWorkspace) {
        if (err) {
          return console.log(err);
        }

        var removeListener;
        var last = activeWorkspace.id;

        var activeChanged = function (id) {
          removeListener();
          last = id;
          removeListener = on('shell.workspaces.updated:' + id, cb);
          cb();
        };

        removeListener = on('shell.workspaces.updated:' + activeWorkspace.id, cb);
        on('shell.workspaces.active-changed', activeChanged);
      });
    }
  });