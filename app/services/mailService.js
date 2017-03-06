(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('mailService', mailService);


  mailService.$inject = ['$http'];
  function mailService($http) {

    var service = {
      sendVerifyEmail: sendVerifyEmail,
    };

    return service;

    function sendVerifyEmail() {
      return $http.post('/api/mail/sendVerifyEmail')
        .then(function(response) {
          if (response.data) {
            return response;
          }
        });
    }

  }

})(angular);