'use strict';

angular.module('shellApp')
  .service('workspaces', function($q, $log, $rootScope, nachosApi) {
    var self = this;
    var _ = require('lodash');
    var path = require('path');
    var activeWorkspace;

    var dipToWidget = function(dip, widget){
      widget.id = dip.id;
      widget.name = dip.name;
      widget.path = path.resolve(widget.path, widget.config.main);
      widget.sizeX = dip.layout.width;
      widget.sizeY = dip.layout.height;
      widget.row = dip.layout.y;
      widget.col = dip.layout.x;

      return widget;
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

    this.addNewWidget = function(widget){
      // Find a better way to assign dip ids
      nachosApi.getAppConfig(function(err, config){
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

    this.saveWidgetLayout = function(widget){
      nachosApi.getAppConfig(function (err, config) {
        if (err) {
          return $log.log(err);
        }

        var workspace = _.findWhere(config.workspaces, { id: activeWorkspace });
        var dip = _.findWhere(workspace.dips, { id: widget.id});
        if(!dip) {
          dip = widgetToDip(widget, dip);
          workspace.dips.push(dip);
        }
        else
        {
          widgetToDip(widget, dip);
        }

        nachosApi.saveAppConfig(config, function(err){
          if(err) {
            $log.log(err);
          }
        });
      });
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

            dipToWidget(dipSettings, dip);

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
          $rootScope.$emit('refreshWorkspace');
        }
      })
    }
});