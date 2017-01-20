(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('userFunctions', userFunctions);


  userFunctions.$inject = ['$http', '$state', 'session', 'USER_ROLES', 'authService'];
  function userFunctions($http, $state, session, USER_ROLES, authService) {

    var service = {
      getDetails: getDetails,
      updateDetails: updateDetails,
      logoutUser: logoutUser,
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
      // TODO
      return {};
    }
    function logoutUser() {
      $http.get('/api/users?id=' + session.getUserId())
        .then(function(response) {
          console.log(response.data[0].name + ' has left the building');
          authService.logout();
          $state.go('home');
        });
    }

  }


})(angular);