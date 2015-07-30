var app = require('app');
var BrowserWindow = require('browser-window');
var path = require('path');

var mainWindow = null;

var pathToShell = path.resolve('./client/index.html');

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    fullscreen: true,
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
});

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});