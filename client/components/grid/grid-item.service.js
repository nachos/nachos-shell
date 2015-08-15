'use strict';

angular.module('shellApp')
  .service('gridItem', function() {
    this.convertToItem = function (layout) {
      layout = layout || {};

      return {
        sizeX: layout.width,
        sizeY: layout.height,
        row: layout.y,
        col: layout.x
      };
    };

    this.convertToLayout = function (itemLayout) {
      return {
        width: itemLayout.sizeX,
        height: itemLayout.sizeY,
        y: itemLayout.row,
        x: itemLayout.col
      };
    }
  });
