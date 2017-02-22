(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsCancelCtrl', SessionsCancelCtrl);


  SessionsCancelCtrl.$inject = ['$scope', '$uibModalInstance', 'appointment'];
  function SessionsCancelCtrl($scope, $uibModalInstance, appointment) {
    $scope.appointment = appointment;

    $scope.cancelAppointment = function() {
      $uibModalInstance.close();
    };

    $scope.close = function() {
      $uibModalInstance.dismiss('close');
    };
  }
})(angular);
