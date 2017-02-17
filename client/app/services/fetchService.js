(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('fetchService', fetchService);


  fetchService.$inject = ['$http'];
  function fetchService($http) {
    var data = {};

    var service = {
      fetchUnits:     fetchUnits,
      fetchLanguages: fetchLanguages,
    };

    return service;


    function fetchUnits() {
      return fetchAPIData('/api/data/units')
        .then(function(response) {
          return response;
        });
    }

    function fetchLanguages() {
      return fetchAPIData('/api/data/languages')
        .then(function(response) {
          return response;
        });
    }

    function fetchAPIData(url) {
      return $http.get(url)
        .then(function(response) {
          if (!response.data) {
            console.log('Error Occured Fetching Data');
          } else if (response.data.length === 0) {
            console.log('Data Set is Empty');
          }
          return response;
        });
    }

  }


})(angular);