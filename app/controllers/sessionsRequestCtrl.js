(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsRequestCtrl', SessionsRequestCtrl);


  SessionsRequestCtrl.$inject = ['$scope', '$uibModalInstance', 'fetchService', 'session', 'sessionService'];
  function SessionsRequestCtrl($scope, $uibModalInstance, fetchService, session, sessionService) {

    $scope.reschedule = !!session;
    $scope.session = session || {};

    // Set up date picker
    $scope.datepicker = {opened: false};

    $scope.datepicker.options = {
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22), // Make this on year in future, or even last day of year.
      minDate: new Date(),
      startingDay: 1,
    };

    $scope.open = function() {
      $scope.datepicker.opened = true;
    };

    //Set up unit picker
    fetchService
      .fetchUnits()
      .then(function(response) {
        if (response.data) $scope.availableUnits = response.data;
      });

    $scope.submit = function(session) {
      sessionService
        .createRequest(session)
        .then(function(response) {
          console.log(response);
        });
      $uibModalInstance.close(session);
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  }
})(angular);
