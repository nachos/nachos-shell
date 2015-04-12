'use strict';

angular.module('movieListApp')
  .controller('MovieListController', function ($scope, $timeout) {
    var movieList = require('movie-list');
    var movieInfo = require('movie-info');
    var _ = require('lodash');
    var Q = require('q');

    $scope.movies = [];
    $scope.loading = true;

    var sortMovies = function (movies) {
      return _.sortBy(movies, function (movie) {
        return movie.imdbRating;
      })
        .reverse();
    };

    var getBackdrop = function (chosenMovie) {
      var deferred = Q.defer();
      if (!chosenMovie.backdrop) {
        $scope.loading = true;
        movieInfo(chosenMovie.Title, function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            chosenMovie.backdrop = "https://image.tmdb.org/t/p/w780" + res.backdrop_path;
            deferred.resolve();
          }
        });
      }
      else {
        deferred.resolve();
      }
      return deferred.promise;
    };

    $scope.chooseMovie = function (chosenMovie) {
      console.log(chosenMovie);
      $timeout(function () {

        var movieIndex = _.findIndex($scope.movies, function (movie) {
          return movie === chosenMovie;
        });

        $scope.movies.splice(movieIndex, 1);

        if ($scope.chosenMovie) {
          $scope.movies.push($scope.chosenMovie);
        }

        $scope.movies = sortMovies($scope.movies);
      });

      getBackdrop(chosenMovie)
        .then(function () {
          $timeout(function () {
            $scope.chosenMovie = chosenMovie;
            $scope.loading = false;
          });
        });
    };

    movieList.listFolder('E:\\Movies', function (err, listData) {
      if (err) {
        return console.log(err);
      }

      listData =_.map(listData.succeeded, function (item){
        return item.response;
      });

      console.log(listData);

      $scope.movies = sortMovies(listData);

      var mostRanked = _.first($scope.movies);

      $scope.chooseMovie(mostRanked);

    });
  });
