(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('searchService', searchService);


  searchService.$inject = ['$http'];
  function searchService($http) {
    var data = {};

    var service = {
      getTutors: getTutors,
      loadGoogleLocations: loadGoogleLocations,
    };

    return service;

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

    function getTutors(query) {
      return $http.post('/api/search', {query: query})
        .then(function(response) {
          return response;
        });
    }

    function loadGoogleLocations(input) {
      var params = {address: input, components: 'country:AU', sensor: false};
      return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {params: params, headers: {Authorization: undefined} })
        .then(function(response) {
          return response.data.results;
        });
    }


  }

})(angular);