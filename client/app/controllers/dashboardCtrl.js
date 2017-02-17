(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('DashboardCtrl', DashboardCtrl);


  DashboardCtrl.$inject = ['$scope', '$state', '$http', 'userFunctions'];
  function DashboardCtrl($scope, $state, $http, userFunctions) {
    
    $scope.session = userFunctions.getSessionDetails(); // Will cause problems if userFunctions.getSessionDetails() changes.

    $scope.logout = function() {
      userFunctions.logout();
    };
  }

})(angular);
