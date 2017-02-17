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
        var params = {address: input, components: 'country:AU', sensor: false};
        return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {params: params})
          .then(function(response) {
            $scope.locationAPI = response.data.results;
            console.log(response.data.results);
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
