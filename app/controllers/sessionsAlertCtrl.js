(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsAlertCtrl', SessionsAlertCtrl);


  SessionsAlertCtrl.$inject = ['$scope', '$uibModalInstance', 'heading', 'message'];
  function SessionsAlertCtrl($scope, $uibModalInstance, heading, message) {
    $scope.heading = heading;
    $scope.message = message;

    $scope.cancel = function() {
      $uibModalInstance.dismiss('close');
    };
  }
})(angular);
