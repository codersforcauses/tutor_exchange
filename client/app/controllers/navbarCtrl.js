(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope', '$location', 'authService', '$rootScope', 'USER_ROLES', 'userFunctions'];
  function NavbarCtrl($scope, $location, authService, $rootScope, USER_ROLES, userFunctions) {
    $scope.isSelected = function(currentLocation) {
      return currentLocation === $location.path();
    };

    $scope.isNavCollapsed = true;
    $scope.logout = function() {
      userFunctions.logoutUser();
      $scope.isLoggedIn = false;
    };
    $scope.$on('$stateChangeStart', function(event, next) {
        if (authService.isAuthenticated()) {
          $scope.isLoggedIn = true;
        } else {
          $scope.isLoggedIn = false;
        }
      });
  }

})(angular);
