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

    function getTutors() {
      return $http.get('/api/search')
        .then(function(response) {
          return response;
        });
    }


  }

})(angular);