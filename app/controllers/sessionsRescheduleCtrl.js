(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsRescheduleCtrl', SessionsRescheduleCtrl);


  SessionsRescheduleCtrl.$inject = ['$scope', '$uibModalInstance', 'session'];
  function SessionsRescheduleCtrl($scope, $uibModalInstance, session) {

    console.log(session);

    $scope.session = session;

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

    $scope.submit = function(session) {
      $uibModalInstance.close(session);
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  }
})(angular);
