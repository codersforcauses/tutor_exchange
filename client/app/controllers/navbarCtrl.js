(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope', '$location', 'userFunctions'];
  function NavbarCtrl($scope, $location, userFunctions) {
    $scope.isNavCollapsed = true;

    $scope.$on('$stateChangeStart', function(event, next) {
        $scope.isLoggedIn = authService.isAuthenticated();
        $scope.isNavCollapsed = true;
      });

    $scope.isSelected = function(currentLocation) {
      return currentLocation === $location.path();
    };

    $scope.logout = function() {
      $scope.isLoggedIn = false;
      userFunctions.logout();
    };
  }

})(angular);
