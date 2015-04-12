'use strict';

angular.module('shellApp')
  .service('grid', function(workspaces) {
    var self = this;
    var _ = require('lodash');

    var itemDragged = function (event, $element, widget) {
      workspaces.saveWidgetLayout(widget);
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
