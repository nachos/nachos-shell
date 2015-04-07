'use strict';

angular.module('shellApp')
  .service('grid', function($log, nachosApi, workspaces) {
    var self = this;
    var _ = require('lodash');

    var itemDragged = function (event, $element, widget) {
      // Use widget.config.name and size and col to save layout.
      nachosApi.getAppConfig(function (err, config) {
        if (err) {
          return $log.log(err);
        }
        var activeWorkspace = workspaces.getActiveWorkspace();
        var workspace = _.findWhere(config.workspaces, { id: activeWorkspace });
        var dip = _.findWhere(workspace.dips, { id: widget.id});
        dip.layout.width = widget.sizeX;
        dip.layout.height = widget.sizeY;
        dip.layout.y = widget.row;
        dip.layout.x = widget.col;
        nachosApi.saveAppConfig(config, function(err){
          if(err) {
            $log.log(err);
          }
        });
      });
    };

    self.settings = {
      columns: 50,
      pushing: false,
      swapping: true,
      floating: false,
      maxRows: 25,
      minSizeX: 5,
      minSizeY: 5,
      draggable: {
        enabled: false,
        //start: itemDragged,
        stop: itemDragged
      },
      resizable: {
        enabled: false,
        handles: ['n', 'e', 's', 'w', 'se', 'sw'],
        //start: itemDragged,
        stop: itemDragged
      }
    };

    self.editMode = false;

    self.toggleEditMode = function(){
      self.editMode = !self.editMode;
      self.settings.resizable.enabled = self.settings.draggable.enabled = self.editMode;
    };
  });
