(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('LoginCtrl', LoginCtrl);


  LoginCtrl.$inject = ['$scope', 'authService', '$state'];
  function LoginCtrl($scope, authService, $state) {

    $scope.submit = function(user) {
      authService
        .login(parseInt(user.id), user.password)
        .then(function(result) {
          if (authService.isAuthenticated()) {
            $state.go('login_success');
          } else {
            $scope.loginForm.$setValidity('serverError', false);
            $scope.errorMsg = result.data.message;
          }
        });
    };
  }

})(angular);
