(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('userFunctions', userFunctions);


  userFunctions.$inject = ['$http', 'session', 'USER_ROLES'];
  function userFunctions($http, session, USER_ROLES) {

    var service = {
      getDetails: getDetails,
      updateDetails: updateDetails,
    };

    return service;

    function getDetails(userId) {
      return $http.get('/api/users?id=' + userId)
      .then(function(response) {
          return response;
        })
        .catch(function(error) {
            console.log('Error Occured Fetching User Details');
          });
    }
    function updateDetails() {
      return {test: 'test'};
    }

  }


})(angular);