'use strict';

angular.module('shellApp')
  .service('grid', function(workspaces) {
    var self = this;

    var itemChanged = function (event, $element, dip) {
      workspaces.saveDipLayout(dip);
    };

    this.settings = {
      columns: 50,
      pushing: false,
      swapping: true,
      floating: false,
      maxRows: 25,
      minSizeX: 5,
      minSizeY: 5,
      draggable: {
        enabled: false,
        stop: itemChanged
      },
      resizable: {
        enabled: false,
        handles: ['n', 'e', 's', 'w', 'se', 'sw'],
        stop: itemChanged
      }
    };

    this.editMode = false;

    this.toggleEditMode = function(){
      self.editMode = !self.editMode;
      self.settings.resizable.enabled = self.settings.draggable.enabled = self.editMode;
    };
  });
