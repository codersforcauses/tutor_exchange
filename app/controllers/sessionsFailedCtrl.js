(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsFailedCtrl', SessionsFailedCtrl);


  SessionsFailedCtrl.$inject = ['$scope', '$uibModalInstance', 'message'];
  function SessionsFailedCtrl($scope, $uibModalInstance, message) {
    $scope.message = message;

    $scope.cancel = function() {
      $uibModalInstance.dismiss('close');
    };
  }
})(angular);
