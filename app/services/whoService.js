(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('whoService', whoService);


  whoService.$inject = ['$http'];
  function whoService($http) {
    var data = {};

    var service = {
      getName:     getName,
    };

    return service;



    function getName(userID) {
      return $http.post('/api/who/get_name', {userID: userID})
        .then(function(response) {
          return response;
        });
    }

  }


})(angular);