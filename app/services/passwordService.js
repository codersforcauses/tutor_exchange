(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('passwordService', passwordService);


  passwordService.$inject = ['$http'];
  function passwordService($http) {

    var service = {
      forgotPassword: forgotPassword,
      resetPassword:  resetPassword,
      changePassword: changePassword,
    };

    return service;

    function forgotPassword(userID) {
      return $http.post('/auth/forgotPassword', {userID: userID})
        .then(function(response) {
          return response;
        });
    }

    function resetPassword(resetData) {
      return $http.post('/auth/resetPassword', {resetData: resetData})
        .then(function(response) {
          return response;
        });
    }

    function changePassword(updatePassword) {
      return $http.post('/auth/changePassword', {updatePassword: updatePassword})
        .then(function(response) {
          return response;
        });
    }

  }


})(angular);