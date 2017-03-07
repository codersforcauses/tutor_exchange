(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('ForgotPasswordCtrl', ForgotPasswordCtrl);


  ForgotPasswordCtrl.$inject = ['$scope', 'passwordService', '$uibModalInstance'];
  function ForgotPasswordCtrl($scope, passwordService, $uibModalInstance) {
    $scope.submit = function(userID) {
      $scope.emailSent = true;
      passwordService
        .forgotPassword(userID)
        .then(function(response) {
          $scope.emailSendResult = response.data;
          if (!response.data.success) {
            delete $scope.emailSent;
          }
        });
    };
    $scope.cancel = function() {
      if (!$scope.emailSent || $scope.emailSendResult.success) {
        $uibModalInstance.dismiss('close');
      }
    };
  }
})(angular);
