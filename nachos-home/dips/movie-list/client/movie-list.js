'use strict';

angular.module('movieListApp')
  .controller('MovieListController', function ($scope) {
    var movieList = require('movie-list');
    var movieInfo = require('movie-info');
    var _ = require('lodash');
    var Q = require('q');

    $scope.movies = [];
    $scope.loading = true;

    var sortMovies = function (movies){
      return _.sortBy(movies, function (movie) {
        return movie.response.imdbRating;
      })
        .reverse();
    };

    var getBackdrop = function (chosenMovie) {
      var deferred = Q.defer();
      if(!chosenMovie.backdrop) {
        $scope.loading = true;
        movieInfo(chosenMovie.title, function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            chosenMovie.backdrop = "https://image.tmdb.org/t/p/w780" + res.backdrop_path;
            deferred.resolve();
          }
        });
      }
      else{
        deferred.resolve();
      }
      return deferred.promise;
    };

    $scope.chooseMovie = function(chosenMovie){
      var movieIndex =_.findIndex($scope.movies, function (movie) {
        return movie === chosenMovie;
      });

      $scope.movies.splice(movieIndex, 1);

      if($scope.chosenMovie){
        $scope.movies.push($scope.chosenMovie);
      }

      $scope.movies = sortMovies($scope.movies);
      $scope.$apply();

      getBackdrop(chosenMovie)
          .then(function () {
            $scope.chosenMovie = chosenMovie;
            $scope.loading = false;
            $scope.$apply();
          });

    };

    movieList.listFolder('D:\\Downloads\\Movies', function (err, listData) {
      if (err) {
        return console.log(err);
      }

      $scope.movies = sortMovies(listData.succeeded);


      var mostRanked = _.first($scope.movies);

      $scope.chooseMovie(mostRanked);

    });
  });