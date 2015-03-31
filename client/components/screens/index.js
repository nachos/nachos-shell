'use strict';

angular.module('shellApp')
  .service('screens', function() {
    var gui = require('nw.gui');
    var _ = require('lodash');
    var screenApi = require('native-api').screen;

    gui.Screen.Init();

    var getScreenOfWindow = function (win) {
      var currentScreen = null;

      _.forEach(screenApi.getAllScreens(), function (screen) {
        if (win.x >= screen.bounds.left && win.x < screen.bounds.right) {
          currentScreen = screen;
          return false;
        }
      });

      return currentScreen;
    };

    this.getScreenByID = function (handle) {
      var currentScreen = null;

      _.forEach(screenApi.getAllScreens(), function (screen) {
        if (screen.handle == handle) {
          currentScreen = screen;
          return false;
        }
      });

      return currentScreen;
    };

    this.getCurrentScreen = function () {
      var currentWindow = gui.Window.get();
      return getScreenOfWindow(currentWindow);
    };

    this.setWindowToScreen = function (screen) {
      var win = gui.Window.get();

      win.moveTo(screen.bounds.left, screen.bounds.top);
      win.enterFullscreen();
      win.show();
    };
  });