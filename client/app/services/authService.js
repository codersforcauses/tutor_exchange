(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('authService', authService);


  authService.$inject = ['$http', 'session', 'USER_ROLES'];
  function authService($http, session, USER_ROLES) {

    var data = {
    };

    var service = {
      login:            login,
      register:         register,
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
            console.log(session.getUserName() + ' has logged in');
          } else {
            console.log('Log in unsuccessful: ' + response.data.message);
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
            session.create(user.id, user.name, response.data.role);
            console.log(session.getUserName() +' registered as ' + session.getUserId());
          } else {
            console.log('Registration unsuccessful: ' + response.data.message);
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
      return (isAuthenticated() && roles.indexOf(session.getUserRole()) !== -1);
    }

  }

})(angular);