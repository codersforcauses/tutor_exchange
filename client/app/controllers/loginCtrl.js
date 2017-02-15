(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('LoginCtrl', LoginCtrl);


  LoginCtrl.$inject = ['$scope', '$state', 'userFunctions'];
  function LoginCtrl($scope, $state, userFunctions) {
    if (userFunctions.isLoggedIn()) {
      $state.go('dashboard');// Already Logged in
    }

    $scope.submit = function(user) {
      userFunctions
        .login(user)
        .then(function(response) {
          if (userFunctions.isLoggedIn()) {
            $state.go('dashboard');
          } else {
            $scope.errorMsg = response.data.message;
            $scope.loginForm.$setPristine();
          }
        });
    };
  }

})(angular);
