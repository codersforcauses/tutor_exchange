(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('DashboardCtrl', DashboardCtrl);


  DashboardCtrl.$inject = ['$scope', 'session', 'authService', '$state', '$http', 'userFunctions'];
  function DashboardCtrl($scope, session, authService, $state, $http, userFunctions) {
    $scope.session = {
      id: session.getUserId(),
      name: session.getUserName(),
      role: session.getUserRole(),
    };

    $scope.logout = function() {
      userFunctions.logoutUser();
    };
  }

})(angular);
