var api = require('nachos-api')('shell');
var path = require('path');
var _ = require('lodash');

var getIframe = function (basePath, config) {
  var mainPath = path.resolve(basePath, config.main);

  var frame = document.createElement("IFRAME");
  frame.setAttribute('seamless', null);
  frame.setAttribute('src', mainPath);
  frame.setAttribute('class', config.type);
  frame.setAttribute('nwdisable', '');
  frame.setAttribute('nwfaketop', '');

  return frame;
};

var setIframe = function (iframe) {
  iframe.contentWindow.require = function (id) {
    // Not working well !!!
    return require(id);
  };
};

var typeHandlers = {};

typeHandlers['background'] = function (basePath, config) {
  var frame = getIframe(basePath, config);
  document.body.appendChild(frame);
  setIframe(frame);
};

typeHandlers['widget'] = function (basePath, config) {
  var frame = getIframe(basePath, config);
  //setIframe(frame);
};



api.getAppConfig(function (err, config) {
  _.forEach(config.dips || [], function (dipName) {
    api.getDip(dipName, function (err, dip) {
      if (err) {
        return console.log('error loading dip %s - %s', dipName, err);
      }

      typeHandlers[dip.config.type](dip.path, dip.config);
    });
  });
});