(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('ApplyCtrl', ApplyCtrl);


  ApplyCtrl.$inject = ['$scope', 'authService', '$state', 'UWA_UNITS', 'USER_ROLES', 'TUTOR_LANGUAGES'];
  function ApplyCtrl($scope, authService, $state, UWA_UNITS, USER_ROLES, TUTOR_LANGUAGES) {
    if (authService.isAuthenticated()) {
      $state.go('dashboard');// Already Logged in
    }

    $scope.availableUnits = UWA_UNITS;
    $scope.tutorLanguages = TUTOR_LANGUAGES;

    $scope.submit = function(user) {

      user.id = parseInt(user.id);
      user.name = user.firstName + ' ' + user.lastName;

      if (user.tutor) {
        user.accountType = USER_ROLES.tutor;
      } else {
        user.accountType = USER_ROLES.student;
      }

      delete user.firstName;
      delete user.lastName;
      delete user.tutor;

      authService
        .register(user)
        .then(function(result) {
          if (authService.isAuthenticated()) {
            $state.go('dashboard');
          } else {
            $scope.errorMsg = result.data.message;
            $scope.applyForm.$setPristine();
          }
        });
    };
  }

})(angular);
