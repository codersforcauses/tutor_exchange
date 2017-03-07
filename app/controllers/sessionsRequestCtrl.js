(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsRequestCtrl', SessionsRequestCtrl);


  SessionsRequestCtrl.$inject = ['$scope', '$uibModalInstance', 'fetchService', 'session', 'sessionService'];
  function SessionsRequestCtrl($scope, $uibModalInstance, fetchService, session, sessionService) {

    $scope.reschedule = !!session;
    $scope.session = {};
    $scope.preFormatTime = {date: null, time: null};

    if (session) {
      angular.copy(session, $scope.session);
      $scope.preFormatTime.date = moment.utc(session.time).format('DD/MM/YYYY');
      $scope.preFormatTime.time = moment.utc(session.time).format('HH:mm');
    }


    // For date picker
    $scope.now = moment().format('DD/MM/YYYY');

    //Set up unit picker
    fetchService
      .fetchUnits()
      .then(function(response) {
        if (response.data) $scope.availableUnits = response.data;
      });

    $scope.submit = function(session, preFormatTime) {
      session.time = moment(preFormatTime.date + preFormatTime.time, 'DD/MM/YYYYHH:mm').format('YYYY-MM-DD HH:mm:ss');
      if (session.unit.unitID) session.unit = session.unit.unitID;

      $uibModalInstance.close(session);
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  }
})(angular);
