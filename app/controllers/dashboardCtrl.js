(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('DashboardCtrl', DashboardCtrl);


  DashboardCtrl.$inject = ['$scope', '$state', '$http', 'userFunctions', 'mailService'];
  function DashboardCtrl($scope, $state, $http, userFunctions, mailService) {

    $scope.session = userFunctions.getSessionDetails(); // Will cause problems if userFunctions.getSessionDetails() changes.
    $scope.resendVerify = function() {
      $scope.emailSent = true;
      mailService
        .sendVerifyEmail()
        .then(function(response) {
            $scope.emailSendResult = response.data;
            if (!response.data.success) {
              delete $scope.emailSent; //Allows you to retry if mail server failed to send
            }
          });
    };
    $scope.logout = function() {
      userFunctions.logout();
    };
  }

})(angular);
