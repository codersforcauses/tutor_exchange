(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsAppealCtrl', SessionsAppealCtrl);


  SessionsAppealCtrl.$inject = ['$scope', '$uibModalInstance'];
  function SessionsAppealCtrl($scope, $uibModalInstance) {

    $scope.submit = function(reason) {
      $uibModalInstance.close(reason);
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  }
})(angular);
