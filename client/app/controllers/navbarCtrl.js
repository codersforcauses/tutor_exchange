(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope'];
  function NavbarCtrl($scope) {
    $scope.isNavCollapsed = true;
  }

})(angular);
