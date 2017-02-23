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

  }

})(angular);