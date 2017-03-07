(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('LoginCtrl', LoginCtrl);


  LoginCtrl.$inject = ['$scope', '$state', 'userFunctions', '$uibModal'];
  function LoginCtrl($scope, $state, userFunctions, $uibModal) {
    if (userFunctions.isLoggedIn()) {
      $state.go('dashboard');// Already Logged in
    }

    $scope.submit = function(user, rememberMe) {
      userFunctions
        .login(user, rememberMe)
        .then(function(response) {
          if (userFunctions.isLoggedIn()) {
            $state.go('dashboard');
          } else {
            $scope.errorMsg = response.data.message;
            $scope.loginForm.$setPristine();
          }
        });
    };

    $scope.openForgotPassword = function() {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/forgotPassword.html',
        controller: 'ForgotPasswordCtrl',
      });
    };

  }

})(angular);
