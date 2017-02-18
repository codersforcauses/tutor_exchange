(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SearchCtrl', SearchCtrl);


  SearchCtrl.$inject = ['$scope', '$http', 'searchService', 'fetchService'];
  function SearchCtrl($scope, $http, searchService, fetchService) {
    $scope.results = [];

    loadAPIData();
    function loadAPIData() {
      fetchService
        .fetchUnits()
        .then(function(response) {
          if (response.data) {
            $scope.availableUnits = response.data;
          }
        });

      fetchService
        .fetchLanguages()
        .then(function(response) {
          if (response.data) {
            $scope.tutorLanguages = response.data;
          }
        });
    }

    $scope.refreshLocations = function(input) {
      if (input.length > 0) {
        searchService
        .loadGoogleLocations(input)
        .then(function(response) {
          $scope.locationAPI = response;
        });
      }
    };


    $scope.submit = function(query) {
      searchService
        .getTutors()
        .then(function(response) {
          if (response.data) {
            $scope.results = response.data;
            console.log(response.data);
          } else {
            console.log('error - todo: more descriptive error message here');
          }
        });
    };

  }

})(angular);