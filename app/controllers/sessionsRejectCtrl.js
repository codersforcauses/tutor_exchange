(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsRejectCtrl', SessionsRejectCtrl);


  SessionsRejectCtrl.$inject = ['$scope', '$uibModalInstance', 'session', 'sessionType'];
  function SessionsRejectCtrl($scope, $uibModalInstance, session, sessionType) {
    $scope.session = session;
    $scope.isRequest = sessionType === 'request';
    $scope.isAppointment = sessionType === 'appointment';

    $scope.reject = function() {
      $uibModalInstance.close();
    };

    $scope.cancle = function() {
      $uibModalInstance.dismiss('close');
    };
  }
})(angular);
