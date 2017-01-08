(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('ApplyCtrl', ApplyCtrl);


  ApplyCtrl.$inject = ['$scope', 'authService', '$state'];
  function ApplyCtrl($scope, authService, $state) {

    $scope.submit = function(user) {

      user.id = parseInt(user.id);
      user.name = user.firstName + ' ' + user.lastName;
      delete user.firstName;
      delete user.lastName;

      authService
        .register(user)
        .then(function(result) {
          if (authService.isAuthenticated()) $state.go('login_success');
        });
    };
  }

})(angular);






/*

angular
  .module('tutorExchange')
  .controller('ApplyCtrl', ['$scope', '$http', '$state', 'myData',
    function($scope, $http, $state, myData) {

      $scope.submit = function() {
        if (!$scope.user) {
          return;
        }

        $http.get('/users?id=' + $scope.user.id)
          .then(function(response) {
            if (response.data.length > 0) {
              console.log('User already exists');
              return;
            }
          });

        $scope.user.name = $scope.user.firstName + ' ' + $scope.user.lastName;

        var data = angular.toJson($scope.user);

        console.log(data);

        $http.post('/users', data)
          .then(function() {
            console.log('New user!!!');
            myData.set($scope.user);
            $state.go('login_success');
          });

      };

    },
  ]);

  */
