(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope', 'authService', '$rootScope', 'USER_ROLES'];
  function NavbarCtrl($scope, authService, $rootScope, USER_ROLES) {
    $scope.isNavCollapsed = true;
    $scope.$on('$stateChangeStart', function(event, next) {
        if (next.data && next.data.authRoles && authService.isAuthenticated()) {
          $scope.loggedinuser = next.data.authRoles[0];
        } else {
          delete $scope.loggedinuser;
        }
      });
  }

})(angular);
