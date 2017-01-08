(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('authService', authService);


  authService.$inject = ['$http', 'session'];
  function authService($http, session) {

    var data = {
    };

    var service = {
      login:            login,
      resgister:        register,
      logout:           logout,
      isAuthenticated:  isAuthenticated,
      isAuthorised:     isAuthorised,
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
            session.create(credentials.id, response.data.name, response.data.role);
            console.log(response.data.name + 'has logged in');
          } else {
            console.log('Log in unsuccessful');
          }
          return response;
        });
    }


    function register(user) {

      user.id = parseInt(userId);

      return $http.post('/auth/register', {user: user})
        .then(function(response) {
          if (response.data.success) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + response.data.token;
            session.create(user.id, '*');
            console.log('Registered as ' + session.getUserId());
          } else {
            console.log('Registration unsuccessful');
          }
          return response;
        });
    }


    function logout() {
      $http.defaults.headers.common.Authorization = '';
      session.destroy();
    }


    function isAuthenticated() {
      return session.exists();
    }


    function isAuthorised(roles) {
      if (!angular.isArray(roles)) {
        roles = [roles];
      }
      return (isAuthenticated() && roles.indexOf(Session.getUserRole) !== -1);
    }

  }

})(angular);