(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('userFunctions', userFunctions);


  userFunctions.$inject = ['$http', '$state', 'session', 'authService'];
  function userFunctions($http, $state, session, authService) {

    var data = {
    };

    var service = {
      login:      login,
      apply:      apply,
      logout:     logout,

      isLoggedIn:         isLoggedIn,
      getSessionDetails:  getSessionDetails,

      getProfile:     getProfile,
      updateProfile:  updateProfile,

    };

    return service;


    function login(user) {
      authService.login(user.id, user.password)
        .then(function(response) {
          if (response.data.success) {
            console.log(session.getUserName() + ' has logged in');
          } else {
            console.log('Log in unsuccessful: ' + response.data.message);
          }
        });
    }


    function apply(user) {
      authService.register(user)
        .then(function(response) {
          if (response.data.success) {
            console.log(session.getUserName() + ' has signed up');
          } else {
            console.log('Application unsuccessful: ' + response.data.message);
          }
        });
    }


    function logout() {
      console.log(session.getUserName() + ' has left the building');
      authService.logout();
      $state.go('home');
    }


    function isLoggedIn() {
      return session.exists();
    }


    function getSessionDetails() {
      return {
        id:   session.getUserId(),
        name: session.getUserName(),
        role: session.getUserRole(),
      };
    }


    function getProfile() {
      return $http.get('/api/getprofile')
      .then(function(response) {
          if (!response.data) {
            console.log('Error Occured Fetching User Details');
          } else if (response.data.length === 0) {
            console.log('User does not Exist');
          }
          return response.data;
        });
    }


    function updateProfile(user) {
      return $http.post('/api/updateprofile', {user: user})
        .then(function(response) {
          if (!response.data.success) {
            console.log('Error Occured Updating User Details');
          }
        });
    }

  }
})(angular);