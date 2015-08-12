'use strict';

angular.module('shellApp')
  .controller('Desktop', function ($scope, $mdDialog, grid, workspaces, $timeout, $mdMenu, $rootScope, $compile) {
    $scope.grid = grid;

    $scope.addDip = function (ev) {
      $mdDialog.show({
        controller: 'AddDip',
        templateUrl: 'app/desktop/add-dip/add-dip.html',
        targetEvent: ev
      })
        .then(function (dip) {
          dip.content = getIframeContent(dip);
          $scope.dips.push(dip);
          workspaces.saveDipLayout(dip);
        });
    };

    $scope.addWorkspace = function (ev) {
      $mdDialog.show({
        controller: 'AddWorkspace',
        templateUrl: 'app/desktop/add-workspace/add-workspace.html',
        targetEvent: ev
      })
        .then(function (name) {
          workspaces.createWorkspace(name);
        });
    };

    workspaces.onActiveChanged(function () {
      renderDips();
    });

    function renderDips() {
      return workspaces.getDips()
        .then(function (dips) {
          dips.forEach(function (dip) {
            dip.content = getIframeContent(dip);
          });

          $timeout(function () {
            $scope.dips = dips;
          });
        })
        .catch(function (err) {
          console.log(err);
        });
    }

    function getIframeContent(dip) {
      var nachosApi = require('nachos-api');

      var api = {
        global: function (globalDefaults) {
          var settings = nachosApi.settings(dip.name, {
            globalDefaults: globalDefaults
          });

          return {
            get: function () {
              return settings.get();
            },
            save: function (config) {
              return settings.save(config);
            },
            onChange: function (callback) {
              settings.onChange(callback);
            }
          };
        },
        instance: function (instanceDefaults) {
          var instance = nachosApi.settings(dip.name)
            .instance(dip.id, {instanceDefaults: instanceDefaults});

          return {
            get: function () {
              return instance.get();
            },
            save: function (config) {
              return instance.save(config);
            },
            onChange: function (callback) {
              instance.onChange(callback);
            }
          };
        }
      };

      var remote = require('remote');
      var relative = require('require-relative');

      return {
        remote: {
          require: function (pkg) {
            return remote.require('./remote-require')(pkg, dip.dir);
          }
        },
        require: function (pkg) {
          return relative(pkg, dip.dir);
        },
        dipApi: api
      };
    }

    renderDips();

    $scope.hi = function (ev) {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.body))
          .title('This is an alert title')
          .content('You can specify some description text in here.')
          .ariaLabel('Alert Dialog Demo')
          .ok('Got it!')
          .targetEvent(ev)
      );
    };

    var offset = { top: 0, left: 0};
    var elem = angular.element('<div class="md-open-menu-container md-whiteframe-z2"><md-menu-content><md-menu-item><md-button ng-click="hi($event)"><span md-menu-align-target>Hello</span></md-button></md-menu-item></md-menu-content></div>');
    $compile(elem)($scope);

    $scope.RightClickMenuCtrl = {
      open: function (event) {
        offset = { top: event.offsetY, left: event.offsetX};
        $mdMenu.show({
          scope: $rootScope.$new(),
          mdMenuCtrl: $scope.RightClickMenuCtrl,
          element: elem,
          target: event.target // used for where the menu animates out of
        });
      },
      close: function () {
        $mdMenu.hide();
      },
      positionMode: function () {
        return {left: 'target', top: 'target'};
      },
      offsets: function () {
        return offset;
      }
    }
  });

angular.module('shellApp')
  .directive('ngRightClick', function ($parse) {
    return function (scope, element, attrs) {
      var fn = $parse(attrs.ngRightClick);
      element.bind('contextmenu', function (event) {
        scope.$apply(function () {
          event.preventDefault();
          fn(scope, {$event: event});
        });
      });
    };
  });