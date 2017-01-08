(function(angular) {

  'use strict';

  angular
    .module('tutorExchange')
    .controller('LoginCtrl', LoginCtrl);


  LoginCtrl.$inject = ['$scope', '$http', '$window', '$state'];
  function LoginCtrl($scope, $http, $window, $state) {

    $scope.submit = function(user) {

      var credentials = {
        id:         parseInt(user.id),
        password:   user.password,
      };

      $http.post('/auth/login', {user: credentials})
        .then(function(response) {
          if (response.data.success) {
            $window.sessionStorage.token = response.data.token;
            console.log('Logged in as ' + user.id);
            $state.go('login_success');
          } else {
            console.log('Log in unsuccessful');
          }
        });
    };
  }

})(angular);
