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

    function getDetails() {
      return $http.get('/api/getprofile')
      .then(function(response) {
          if (!response.data) {
            console.log('Error Occured Fetching User Details');
          } else if (response.data.length === 0) {
            console.log('User does not Exist');
          }
          return response;
        });
    }

    function updateDetails(user) {
      return $http.post('/api/updateprofile', {user: user})
        .then(function(response) {
          if (!response.data.success) {
            console.log('Error Occured Updating User Details');
          }
          return response;
        });
    }

    function logoutUser() {
      console.log(session.getUserName() + ' has left the building');
      authService.logout();
      $state.go('home');
    }

  }


})(angular);