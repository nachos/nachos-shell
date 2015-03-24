var api = require('nachos-api')('shell');
var path = require('path');
var _ = require('lodash');
var gui = require('nw.gui');

var screenID = gui.App.argv[0];
var currentScreen = screenID ? screens.getScreenByID(screenID) : screens.getCurrentScreen();
screens.setWindowToScreen(currentScreen);

var getIframe = function (basePath, config) {
  var mainPath = path.resolve(basePath, config.main);

  var frame = $(document.createElement("IFRAME"));
  frame.attr('seamless', null);
  frame.attr('src', mainPath);
  frame.attr('class', config.type);
  frame.attr('nwdisable', '');
  frame.attr('nwfaketop', '');

  return frame;
};

var setIframe = function (iframe, dipPath) {
  iframe[0].contentWindow.require = function (id) {

    // Need to cover all cases
    if (id.startsWith('./')) {
      id = id.replace('./', dipPath + '/');
      id = path.resolve(id);
    }
    else {
      id = path.join(dipPath, 'node_modules', id);
    }

    return require(id);
  };
};

var typeHandlers = {};

typeHandlers.background = function (basePath, config) {
  var frame = getIframe(basePath, config);
  $(document.body).append(frame);
  setIframe(frame);
};

typeHandlers.widget = function (basePath, config, layout) {
  var grid = $('.grid-stack').data('gridstack');

  var frame = getIframe(basePath, config);

  var divItem = $(document.createElement('div'));
  divItem.addClass('grid-stack-item');

  var divContent = $(document.createElement('div'));
  divContent.addClass('grid-stack-item-content ');

  divContent.append(frame);
  divItem.append(divContent);
  grid.add_widget(divItem, layout.x, layout.y, layout.width, layout.height, true);

  setIframe(frame, basePath);
};

api.getAppConfig(function (err, config) {
  if (err) return console.log(err);

  _.forEach((config[screenID] ? config[screenID].dips : config.dips ) || [], function (dipSettings) {
    api.dips.get(dipSettings.name, function (err, dip) {
      if (err) {
        return console.log('error loading dip %s - %s', dipSettings.name, err);
      }

      typeHandlers[dip.config.type](dip.path, dip.config, dipSettings.layout);
    });
  });
});

$(function () {
  var options = {
    always_show_resize_handle: true,
    animate: true,
    float: true
  };

  $('.grid-stack').gridstack(options);
});