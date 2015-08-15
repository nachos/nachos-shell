'use strict';

angular.module('shellApp')
  .service('workspaces', function ($log, settings, gridItem, $rootScope, $q) {
    var self = this;
    var _ = require('lodash');
    var path = require('path');
    var uuid = require('node-uuid');
    var nachosApi = require('nachos-api');
    var packages = require('nachos-packages');

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

    /**
     *
     * @param id
     */
    function setActiveWorkspace(id) {
      return settings.set({lastWorkspace: id})
        .then(function () {
          emit('shell.workspaces.active-changed', id);

          return $q.resolve();
        });
    }

    /**
     *
     * @returns {$q.promise}
     */
    this.getActiveWorkspace = function () {
      return settings.get()
        .then(function (config) {
          if (_.isEmpty(config.workspaces)) {
            return self.createWorkspace('home')
              .then(function (activeWorkspace) {

                return setActiveWorkspace(activeWorkspace.id).then(function () {
                  return activeWorkspace;
                });
              });
          }

          var id = config.workspaces[config.lastWorkspace] ? config.lastWorkspace : Object.keys(config.workspaces)[0];
          var workspace = config.workspaces[id];

          workspace.id = id;

          return workspace;
        });
    };

    /**
     *
     * @returns {*}
     */
    this.getWorkspacesMeta = function () {
      return settings.get()
        .then(function (config) {
          return _.mapValues(config.workspaces, function (workspace) {
            return workspace.name;
          });
        });
    };

    /**
     *
     * @param id
     * @returns {*}
     */
    this.changeWorkspace = function (id) {
      var self = this;

      return settings.get()
        .then(function (config) {
          var workspace = config.workspaces[id];

          if (!workspace) {
            $log.error('No such workspace ' + id);
          }
          else {
            return self.getActiveWorkspace()
              .then(function (activeWorkspace) {
                if (activeWorkspace.id != id) {
                  return setActiveWorkspace(id);
                }
              });
          }
        });
    };

    /**
     *
     * @param name
     * @returns {$q.promise}
     */
    this.createWorkspace = function (name) {
      var id = uuid.v4();

      var newSettings = {
        workspaces: {}
      };

      newSettings.workspaces[id] = {
        name: name,
        dips: []
      };

      return settings.set(newSettings)
        .then(function () {
          emit('shell.workspaces.created', id);
          return setActiveWorkspace(id)
            .then(function () {
              var workspace = newSettings.workspaces[id];

              workspace.id = id;

              return workspace;
            });
        })
    };

    this.saveWorkspace = function (workspace) {
      return settings.get()
        .then(function (config) {
          config.workspaces[workspace.id] = workspace;

          return settings.save(config)
            .then(function () {
              emit('shell.workspaces.updated:' + workspace.id, null, true);

              return $q.resolve();
            });
        });
    };

    /**
     *
     * @param cb
     */
    this.onWorkspacesChanged = function (cb) {
      on('shell.workspaces.created', cb);
      on('shell.workspaces.updated', cb);
    };

    /**
     *
     * @param cb
     * @returns {*}
     */
    this.onActiveChanged = function (cb) {
      return this.getActiveWorkspace()
        .then(function (activeWorkspace) {
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
  }
)
;