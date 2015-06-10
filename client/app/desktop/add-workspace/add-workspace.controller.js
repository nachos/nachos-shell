'use strict';

angular.module('shellApp')
  .controller('AddWorkspace', function($scope, $mdDialog) {
    $scope.workspaceName = '';

    $scope.add = function () {
      if($scope.workspaceName) {
        $mdDialog.hide($scope.workspaceName);
      }
    }
  });
