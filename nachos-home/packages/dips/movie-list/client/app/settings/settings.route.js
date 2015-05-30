'use strict';

angular.module('movieListApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('settings', {
        url: '/settings',
        controller: 'Settings',
        templateUrl: 'client/app/settings/settings.html'
      });
  });
