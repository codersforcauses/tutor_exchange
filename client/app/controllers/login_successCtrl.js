(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('LoginSuccessCtrl', LoginSuccessCtrl);


  LoginSuccessCtrl.$inject = ['$scope', 'session', '$state', '$http', '$window'];
  function LoginSuccessCtrl($scope, session, $state, $http, $window) {
    $scope.user = {name: session.getUserName()};

    $scope.logout = function() {

      //$http.get('/api/users?id=' + session.getUserId(), {headers: {'authorization': 'Bearer ' + $window.sessionStorage.token}})
      $http.get('/api/users?id=' + session.getUserId())
        .then(function(response) {
          console.log(response.data[0].name + ' has left the building');
        });

      session.destroy();
      $state.go('home');
    };
  }

})(angular);
