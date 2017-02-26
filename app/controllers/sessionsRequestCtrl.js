(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsRequestCtrl', SessionsRequestCtrl);


  SessionsRequestCtrl.$inject = ['$scope', '$uibModalInstance', 'fetchService', 'session'];
  function SessionsRequestCtrl($scope, $uibModalInstance, fetchService, session) {

    $scope.reschedule = !!session;
    $scope.session = {};

    if (session) {
      angular.copy(session, $scope.session);
    }

    // For date picker
    $scope.now = moment().format('DD/MM/YYYY');

    //Set up unit picker
    fetchService
      .fetchUnits()
      .then(function(response) {
        if (response.data) $scope.availableUnits = response.data;
      });

    $scope.submit = function(session) {
      $uibModalInstance.close(session);
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  }
})(angular);
