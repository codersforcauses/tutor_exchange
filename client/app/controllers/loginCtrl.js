(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('LoginCtrl', LoginCtrl);


  LoginCtrl.$inject = ['$scope', 'authService', '$state'];
  function LoginCtrl($scope, authService, $state) {
    if (authService.isAuthenticated()) {
      $state.go('dashboard');// Already Logged in
    }
    $scope.submit = function(user) {
      authService
        .login(parseInt(user.id), user.password)
        .then(function(result) {
          if (authService.isAuthenticated()) {
            $state.go('dashboard');
          } else {
            $scope.errorMsg = result.data.message;
            $scope.loginForm.$setPristine();
          }
        });
    };
  }

})(angular);
