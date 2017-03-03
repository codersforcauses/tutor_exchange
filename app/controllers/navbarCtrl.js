(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope', '$state', '$location', 'userFunctions', 'loginSession'];
  function NavbarCtrl($scope, $state, $location, userFunctions, loginSession) {
    $scope.isNavCollapsed = true;

    $scope.$on('$stateChangeStart', function(event, next) {
        $scope.isNavCollapsed = true;
      });

    $scope.isSelected = function(currentLocation) {
      return currentLocation === $location.path();
    };

    $scope.showIcon = function(path) {
      if (path === 'logout') {
        return userFunctions.isLoggedIn();
      }

      if (!$state.get(path).data) {
        return !userFunctions.isLoggedIn();
      }
      return $state.get(path).data.authRoles.indexOf(loginSession.getUserRole()) !== -1;
    };

    $scope.logout = function() {
      $scope.loggedInUser = loginSession.getUserRole();
      userFunctions.logout();
    };
  }

})(angular);
