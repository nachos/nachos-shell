'use strict';

angular.module('movieListApp')
  .controller('MovieList', function ($scope, $timeout, $log, $mdToast, $state) {
    var movieList = require('movie-list');
    var movieInfo = require('movie-info');
    var _ = require('lodash');
    var Q = require('q');

    var sortMovies = function (movies) {
      return _.sortBy(movies, function (movie) {
        return movie.response.imdbRating;
      }).reverse();
    };

    var getBackdrop = function (chosenMovie) {
      var deferred = Q.defer();
      if (!chosenMovie.backdrop) {
        $scope.loading = true;
        movieInfo(chosenMovie.response.Title, function (err, res) {
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

    $scope.initialLoading = true;

    $scope.chooseMovie = function (chosenMovie) {
      console.log(chosenMovie);
      /*$timeout(function () {

       var movieIndex = _.findIndex($scope.movies, function (movie) {
       return movie === chosenMovie;
       });

       $scope.movies.splice(movieIndex, 1);

       if ($scope.chosenMovie) {
       $scope.movies.push($scope.chosenMovie);
       }

       $scope.movies = sortMovies($scope.movies);
       $scope.chosenMovie = chosenMovie;
       });*/

      getBackdrop(chosenMovie)
        .then(function () {
          $timeout(function () {
            $scope.chosenMovie = chosenMovie;
            $scope.loading = false;
          });
        });
    };

    $scope.playChosen = function () {
      dipApi.fs.open({}, {path: $scope.chosenMovie.path});
    };

    var loadMovies = function (cb) {

      if (!$scope.config.instance) {
        $state.go('settings');
      }

      $scope.movies = [];
      $scope.loading = true;

      movieList.listFolder($scope.config.instance.directory, function (err, listData) {
        if (err) {
          return console.log(err);
        }

        if (!listData.succeeded) {
          notify('Empty movie directory');

          $state.go('settings');
        }

        $timeout(function () {
          $scope.movies = sortMovies(listData.succeeded);

          var mostRanked = _.first($scope.movies);

          $scope.chooseMovie(mostRanked);

          cb();
        });
      });
    };

    function notify(msg) {
      $mdToast.show(
        $mdToast.simple()
          .content(msg)
          .position('bottom right')
      );
    }

    $scope.config = {};

    dipApi.global.get(function (err, config) {
      if (err) {
        // Deal with this error somehow.. maybe move to settings screen
        $log.log(err);
      }
      $scope.config.global = config;

      dipApi.instance.get(function (err, config) {
        if (err) {
          // Deal with this error somehow.. maybe move to settings screen
          $log.log(err);
        }
        $scope.config.instance = config;
        loadMovies(function () {
          $scope.initialLoading = false;
        });
      });
    });

    dipApi.instance.onChange(function (config) {
      $scope.config.instance = config;
      $timeout(function () {
        loadMovies();
      });
    });

    dipApi.global.onChange(function (config) {
      $scope.config.global = config;
      $timeout(function () {
        $scope.initialLoading = true;

        loadMovies(function () {
          $scope.initialLoading = false;
        });
        notify('Global settings changed');
      });
    });
  });
