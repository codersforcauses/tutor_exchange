(function(angular) {
'use strict';

angular
  .module('tutorExchange')
  .controller('ProfileCtrl', ProfileCtrl);


ProfileCtrl.$inject = ['$scope', 'session', 'authService', 'userFunctions', '$state', '$http', 'UWA_UNITS'];
function ProfileCtrl($scope, session, authService, userFunctions, $state, $http, UWA_UNITS) {
  $scope.availableUnits = UWA_UNITS;
  userFunctions
  .getDetails(session.getUserId())
  .then(function(response) {
      $scope.user = response.data[0];
      console.log(response.data[0]);
    }
  );
}
})(angular);
