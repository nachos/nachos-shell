var app = require('app');
var BrowserWindow = require('browser-window');
var path = require('path');
var backgrounder = require('window-backgrounder');

var mainWindow = null;

var pathToShell = path.join(app.getAppPath(), './client/index.html');

app.on('ready', function () {
  var electronScreen = require('screen');
  var size = electronScreen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    'skip-taskbar': true,
    width: size.width,
    height: size.height,
    frame: false,
    type: 'desktop',
    'web-preferences': {
      'web-security': false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + pathToShell);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.hookWindowMessage(70, function (wParam, lParam) {
    backgrounder.disableZOrder(lParam);
  })
});

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});