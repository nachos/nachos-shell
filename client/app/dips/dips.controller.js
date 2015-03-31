'use strict';

angular.module('shellApp')
  .controller('DipsController', function($scope, dips) {
    $scope.dips = [];
    $scope.editMode = false;

    $scope.toggleEditMode = function(){
      $scope.editMode = !$scope.editMode;
      $scope.gridsterOpts.resizable.enabled = $scope.gridsterOpts.draggable.enabled = $scope.editMode;
    };

    var itemDragged = function (event, $element, widget) {
      // Use widget.config.name and size and col to save layout.
    };

    // Set somehow max height and not rows
    $scope.gridsterOpts = {
      columns: 50,
      pushing: true,
      swapping: true,
      floating: false,
      maxRows: 50,
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

    dips.getDips().then(function (dips) {
      $scope.dips = dips;
    })
  });
