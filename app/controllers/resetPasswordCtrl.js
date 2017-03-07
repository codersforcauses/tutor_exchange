(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('ResetPasswordCtrl', ResetPasswordCtrl);


  ResetPasswordCtrl.$inject = ['$scope', '$state', '$http', '$stateParams', 'passwordService'];
  function ResetPasswordCtrl($scope, $state, $http, $stateParams, passwordService) {
    if ($stateParams.id === undefined || $stateParams.token === undefined) {
      $state.go('login'); //Redirects invalid requests
    }
    $scope.resetData = $stateParams;

    $scope.submit = function(resetData) {
      passwordService
        .resetPassword(resetData)
        .then(function(response) {
          console.log(response);
        });
    };

  }
})(angular);
