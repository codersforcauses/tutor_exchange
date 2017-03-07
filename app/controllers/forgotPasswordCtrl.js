(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('ForgotPasswordCtrl', ForgotPasswordCtrl);


  ForgotPasswordCtrl.$inject = ['$scope', 'passwordService'];
  function ForgotPasswordCtrl($scope, passwordService) {
    $scope.submit = function(userID) {
      passwordService
        .forgotPassword(userID)
        .then(function(response) {
          console.log(response);
        });
    };

  }
})(angular);
