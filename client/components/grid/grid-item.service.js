'use strict';

angular.module('shellApp')
  .service('gridItem', function() {
    var path = require('path');

    var self = this;

    this.createItem = function (dipConfig, dipLayout) {
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

    this.createLayoutFromItem = function (gridItem) {
      return {
        id: gridItem.id,
        path: gridItem.path,
        name: gridItem.name,
        layout: self.getLayoutFromItem(gridItem)
      };
    };

    this.getLayoutFromItem = function (gridItem) {
      return {
        width: gridItem.sizeX,
        height: gridItem.sizeY,
        y: gridItem.row,
        x: gridItem.col
      }
    };
  });
