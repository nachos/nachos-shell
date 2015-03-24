var gui = require('nw.gui');
var _ = require('lodash');

gui.Screen.Init();

var getScreenOfWindow = function (win) {
  var currentScreen = null;

  _.forEach(gui.Screen.screens, function (screen) {
    if (win.x >= screen.bounds.x && win.x < screen.bounds.x + screen.bounds.width) {
      currentScreen = screen;
      return false;
    }
  });

  return currentScreen;
};

var getScreenByID = function (id) {
  var currentScreen = null;

  _.forEach(gui.Screen.screens, function (screen) {
    if (screen.id === id) {
      currentScreen = screen;
      return false;
    }
  });

  return currentScreen;
};

var getCurrentScreen = function () {
  var currentWindow = gui.Window.get();
  return getScreenOfWindow(currentWindow);
};

var setWindowToScreen = function (screen) {
  var win = gui.Window.get();

  win.moveTo(screen.bounds.x, screen.bounds.y);
  win.enterFullscreen();
  win.show();
};

var screens = {
  getScreenByID: getScreenByID,
  getCurrentScreen: getCurrentScreen,
  setWindowToScreen: setWindowToScreen
};