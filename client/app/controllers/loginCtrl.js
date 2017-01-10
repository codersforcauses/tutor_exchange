(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('LoginCtrl', LoginCtrl);


  LoginCtrl.$inject = ['$scope', 'authService', '$state'];
  function LoginCtrl($scope, authService, $state) {

    $scope.$watch('$scope.loginFrom', function(newValue, oldValue) {
      $scope.loginForm.$setValidity('serverError', true);
    });


    $scope.submit = function(user) {
      authService
        .login(parseInt(user.id), user.password)
        .then(function(result) {
          if (authService.isAuthenticated()) {
            $state.go('login_success');
          } else {
            $scope.errorMsg = result.data.message;
            $scope.loginForm.$setPristine();
          }
        });
    };
  }

})(angular);
