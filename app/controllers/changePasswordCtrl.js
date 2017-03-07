(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('ChangePasswordCtrl', ChangePasswordCtrl);


  ChangePasswordCtrl.$inject = ['$scope', 'passwordService', '$uibModalInstance'];
  function ChangePasswordCtrl($scope, passwordService, $uibModalInstance) {
    $scope.submit = function(updatePassword) {
      passwordService
        .changePassword(updatePassword)
        .then(function(response) {
          if (response.data.success) {
            $uibModalInstance.dismiss('close');
          } else {
            $scope.changePasswordMsg = response.data;
          }
        });
    };
    $scope.cancel = function() {
      $uibModalInstance.dismiss('close');
    };
  }
})(angular);
