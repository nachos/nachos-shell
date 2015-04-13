'use strict';

angular.module('shellApp')
  .directive('nchIframe', function() {
    return {
      restrict: 'E',
      replace: true,
      scope:{
        src: "="
      },
      template:'<iframe seamless nwdisable nwfaketop></iframe>',
      link: function(scope, ele, attr, ctrl) {
        var path = require('path');

        ele.attr('src', scope.src);
        var content = ele[0].contentWindow;
        content.require = function (id) {
          var dipPath = path.dirname(scope.src);

          // Need to cover all cases
          if (id.startsWith('./')) {
            id = id.replace('./', dipPath  + '/');
            id = path.resolve(id);
          }
          else {
            id = path.join(dipPath , 'node_modules', id);
          }

          return require(id);
        };

        content.nachosApi = require('nachos-api');
      }
    };
  });