(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('userFunctions', userFunctions);


  userFunctions.$inject = ['$http', '$state', 'loginSession', 'authService'];
  function userFunctions($http, $state, loginSession, authService) {

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
      changePassword: changePassword,
      upgradeAccount: upgradeAccount,
    };

    return service;


    function login(user, rememberMe) {
      return authService.login(user.id, user.password)
        .then(function(response) {
          if (response.data.success) {
            console.log(loginSession.getUserName() + ' has logged in');
            if (rememberMe) authService.storeToken();

          } else {
            console.log('Log in unsuccessful: ' + response.data.message);
          }
          return response;
        });
    }


    function apply(user) {
      return authService.register(user)
        .then(function(response) {
          if (response.data.success) {
            console.log(loginSession.getUserName() + ' has signed up');
          } else {
            console.log('Application unsuccessful: ' + response.data.message);
          }
          return response;
        });
    }


    function logout() {
      console.log(loginSession.getUserName() + ' has left the building');
      authService.logout();
      $state.go('home');
    }


    function isLoggedIn() {
      return loginSession.exists();
    }


    function getSessionDetails() {
      return {
        id:   loginSession.getUserId(),
        name: loginSession.getUserName(),
        role: loginSession.getUserRole(),
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
          return response;
        });
    }


    function updateProfile(user) {
      return $http.post('/api/updateprofile', {user: user})
        .then(function(response) {
          if (!response.data.success) {
            console.log('Error Occured Updating User Details');
          }
          return response;
        });
    }

    function upgradeAccount(user) {
      user.id = parseInt(user.id);
      return $http.post('/auth/upgrade', {user: user})
        .then(function(response) {
          if (response.data.success) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + response.data.token;
            loginSession.upgradeToTutor();
          }
          return response;
        });
    }

    function changePassword() {
      return;
    }

  }
})(angular);