'use strict';

angular.module('movieListApp')
  .controller('MovieListController', function ($scope) {
    var movieList = require('movie-list');
    var movieInfo = require('movie-info');
    var _ = require('lodash');


    movieList.listFolder('E:\\Movies', function (err, listData) {
      if (err) {
        return console.log(err);
      }

      console.log(listData);

      var movies =
        _.sortBy(listData.succeeded, function (movie) {
          return movie.response.imdbRating;
        })
          .reverse();

      var mostRanked = _.first(movies);

      movieInfo(mostRanked.title, function (err, res) {
        mostRanked.backdrop = "https://image.tmdb.org/t/p/w780" + res.backdrop_path;

        $scope.mostRanked = mostRanked;
        $scope.doneLoading = true;

        $scope.$apply();
      });

      $scope.movies = _.drop(movies, 1);
    });
  });
