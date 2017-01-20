(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope', '$location', 'authService', '$rootScope', 'USER_ROLES', 'userFunctions'];
  function NavbarCtrl($scope, $location, authService, $rootScope, USER_ROLES, userFunctions) {
    $scope.$on('$stateChangeStart', function(event, next) {
        $scope.isLoggedIn = authService.isAuthenticated();
      });

    $scope.isSelected = function(currentLocation) {
      return currentLocation === $location.path();
    };

    $scope.isNavCollapsed = true;
    $scope.logout = function() {
      $scope.isLoggedIn = false;
      userFunctions.logoutUser();
    };
  }

})(angular);
