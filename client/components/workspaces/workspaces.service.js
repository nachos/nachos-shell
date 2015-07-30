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
     * @returns {$q.promise}
     */
    function getActiveWorkspace() {
      return settings.get()
        .then(function (config) {
          if (_.isEmpty(config.workspaces)) {
            return self.createWorkspace('home')
              .then(function (activeWorkspace) {

                return setActiveWorkspace(activeWorkspace.id);
              });
          }

          var id = config.workspaces[config.lastWorkspace] ? config.lastWorkspace : Object.keys(config.workspaces)[0];

          return {id: id, workspace: config.workspaces[id]};
        });
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
     * @param workspace
     * @returns {*}
     */
    function getWorkspaceDips(workspace) {
      var workspaceDipsPromises = _.map(workspace.dips, function (dipLayout) {
        return packages.getDip(dipLayout.name)
          .then(function (dipConfig) {
            var item = gridItem.createItem(dipConfig, dipLayout);

            return item;
          });
      });

      return $q.all(workspaceDipsPromises)
        .then(function (dips) {
          var filtered = _.filter(dips, function (dip) {
            return !!dip;
          });

          return filtered;
        });
    }

    /**
     *
     * @param item
     * @returns {*}
     */
    this.saveDipLayout = function (item) {
      return settings.get()
        .then(function (config) {
          return getActiveWorkspace()
            .then(function (activeWorkspace) {
              var dipLayout = _.findWhere(activeWorkspace.workspace.dips, {id: item.id});

              if (!dipLayout) {
                dipLayout = gridItem.createLayoutFromItem(item);
                activeWorkspace.workspace.dips.push(dipLayout);
              } else {
                dipLayout.layout = gridItem.getLayoutFromItem(item);
              }

              config.workspaces[activeWorkspace.id] = activeWorkspace.workspace;
              return settings.save(config)
                .then(function () {
                  emit('shell.workspaces.updated:' + activeWorkspace.id, null, true);

                  return $q.resolve();
                });
            });
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
     * @returns {*}
     */
    this.getDips = function () {
      return getActiveWorkspace()
        .then(function (activeWorkspace) {

          return getWorkspaceDips(activeWorkspace.workspace);
        });
    };

    /**
     *
     * @param id
     * @returns {*}
     */
    this.changeWorkspace = function (id) {
      return settings.get()
        .then(function (config) {
          var workspace = config.workspaces[id];

          if (!workspace) {
            $log.error('No such workspace ' + id);
          }
          else {
            return getActiveWorkspace()
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

              return {id: id, workspace: newSettings.workspaces[id]}
            });
        })
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
      return getActiveWorkspace()
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
  });