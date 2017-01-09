(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('ApplyCtrl', ApplyCtrl);


  ApplyCtrl.$inject = ['$scope', 'authService', '$state', 'UWA_UNITS'];
  function ApplyCtrl($scope, authService, $state, UWA_UNITS) {
    
    $scope.availableUnits = UWA_UNITS;

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
