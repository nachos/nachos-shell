'use strict';

angular.module('shellApp')
  .run(function (grid, $timeout) {
    var nachosApi = require('nachos-api');

    nachosApi.on('shell:toggleEditMode', function () {
      $timeout(function () {
        grid.toggleEditMode();
      });
    });
  })
  .service('grid', function(dips) {
    var nachosApi = require('nachos-api');
    var self = this;

    var itemChanged = function (event, $element, dip) {
      var id = $element.attr('data-widget-id');
      dips.saveWidgetLayout(id, dip);
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
      nachosApi.emit('shell:editModeChanged', self.editMode);
    };
  });
