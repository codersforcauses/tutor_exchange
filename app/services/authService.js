(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('authService', authService);


  authService.$inject = ['$http', '$window', 'loginSession'];
  function authService($http, $window, loginSession) {

    var data = {
    };

    var service = {
      login:            login,
      register:         register,
      logout:           logout,
      isAuthenticated:  isAuthenticated,
      isAuthorised:     isAuthorised,
      storeToken:       storeToken,
      retrieveToken:    retrieveToken,
    };

    return service;


    function login(userId, password) {

      var credentials = {
        id:         parseInt(userId),
        password:   password,
      };

      return $http.post('/auth/login', {user: credentials})
        .then(function(response) {
          if (response.data.success) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + response.data.token;
            loginSession.create(credentials.id, response.data.name, response.data.role);
          }
          return response;
        });
    }


    function register(user) {

      user.id = parseInt(user.id);

      return $http.post('/auth/register', {user: user})
        .then(function(response) {
          if (response.data.success) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + response.data.token;
            loginSession.create(user.id, response.data.name, response.data.role);
          }
          return response;
        });
    }


    function logout() {
      $http.defaults.headers.common.Authorization = '';
      loginSession.destroy();
      $window.localStorage.removeItem('token');
    }


    function isAuthenticated() {
      return loginSession.exists();
    }


    function isAuthorised(roles) {
      if (!angular.isArray(roles)) {
        roles = [roles];
      }
      return (isAuthenticated() && roles.indexOf(loginSession.getUserRole()) !== -1);
    }


    function storeToken() {
      // Store session details and/or token in local storage
      if ($window.localStorage) {
        $window.localStorage.setItem('token', $http.defaults.headers.common.Authorization);
      }
    }


    function retrieveToken() {

      var token = $window.localStorage && $window.localStorage.getItem('token');
      if (!token) return;

      $http.defaults.headers.common.Authorization = token; // Bearer already there!
      return $http.get('/auth/me')
        .then(
          function(response) {
            if (response.data && response.data.success) {
              $http.defaults.headers.common.Authorization = 'Bearer ' + response.data.token;
              loginSession.create(response.data.id, response.data.name, response.data.role);
            }
            return response;
          },
          function() {
            logout();
          }
        );
    }

  }

})(angular);