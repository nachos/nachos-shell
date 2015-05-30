'use strict';
angular.module('movieListApp', ['ngMaterial', 'ui.router'])
  .config(function($urlRouterProvider, $mdThemingProvider){
    $urlRouterProvider
      .otherwise('/');

    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('lime');
  });