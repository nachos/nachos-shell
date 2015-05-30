'use strict';

angular.module('movieListApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        controller: 'MovieList',
        templateUrl: 'client/app/main/movie-list.html'
      });
  });
