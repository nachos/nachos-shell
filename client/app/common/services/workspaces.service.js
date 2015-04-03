'use strict';

angular.module('shellApp')
  .service('workspaces', function($q, $log, nachosApi) {
    var _ = require('lodash');
    var path = require('path');
    var activeWorkspace;
    var shellScope;

    this.registerScope = function(scope){
      shellScope = scope;
    };

    /*
    * fullData - When you require the actual layout of the workspace, and not just the name and id
     */
    this.getWorkspaces = function(fullData){
        var deferred = $q.defer();

        // Make async
        nachosApi.getAppConfig(function (err, config) {
          if (err) {
            deferred.reject(err);
            return $log.log(err);
          }

          var workspaces = [];

          _.forEach(config.workspaces || [], function(workspace){
            if(fullData)
              workspaces.push(workspace);
            else
              workspaces.push({ id: workspace.id, name: workspace.name});

            if(!activeWorkspace)
            {
              if(workspace.selected)
              {
                activeWorkspace = workspace.id;
              }
            }
          });
          deferred.resolve(workspaces);
        });

      return deferred.promise;
    };

    this.getDips = function(){
      var deferred = $q.defer();
      this.getWorkspaces(true).then(function(workspaces){
        var updatedWorkspace = _.findWhere(workspaces, { 'id': activeWorkspace });
        activeWorkspace = updatedWorkspace.id;

        var dips = [];
        $q.all(updatedWorkspace.dips.map(function (dipSettings) {
          var dipDefer = $q.defer();
          nachosApi.dips.get(dipSettings.name, function (err, dip) {
            if (err) {
              return $log.log('error loading dip %s - %s', dipSettings.name, err);
            }

            dip.path = path.resolve(dip.path, dip.config.main);
            dip.sizeX = dipSettings.layout.width;
            dip.sizeY = dipSettings.layout.height;
            dip.row = dipSettings.layout.y;
            dip.col = dipSettings.layout.x;

            dips.push(dip);
            dipDefer.resolve();
          });
          return dipDefer.promise;
        })).then(function(){
          deferred.resolve(dips);
        });
      });
      return deferred.promise;
    };

    this.changeWorkspace = function(id){
      this.getWorkspaces().then(function(workspaces){
        if(!_.findWhere(workspaces, { 'id': id }))
        {
          $log.error('No such workspace ' + id);
        }
        else if( activeWorkspace != id) {
          activeWorkspace = id;
          shellScope.$emit('refreshWorkspace');
        }
      })
    }
  });