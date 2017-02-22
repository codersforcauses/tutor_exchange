(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionCtrl', SessionCtrl);


  SessionCtrl.$inject = ['$scope', 'sessionService'];
  function SessionCtrl($scope, sessionService) {

    (function update() {
      getRequests();
      getAppointments();
      getOpenSessions();
    })();

    $scope.acceptRequest = acceptRequest;
    $scope.cancelAppointment = cancelAppointment;
    $scope.rescheduleAppointment = cancelAppointment;
    $scope.closeSession = closeSession;
    $scope.appealSession = appealSession;






    function getRequests() {
      sessionService.getRequests()
        .then(function(response) {
          if (response.data) {
            $scope.requests = response.data;
            $scope.hasRequests = $scope.requests && $scope.requests.length !== 0;
          } else {
            $scope.hasRequests = false;
          }
        });
    }

    function getAppointments() {
      sessionService.getAppointments()
        .then(function(response) {
          if (response.data) {
            $scope.appointments = response.data;
            $scope.hasAppointments = $scope.appointments && $scope.appointments.length !== 0;
          } else {
            $scope.hasAppointments = false;
          }
        });
    }

    function getOpenSessions() {
      sessionService.getOpenSessions()
        .then(function(response) {
          if (response.data) {
            $scope.openSessions = response.data;
            $scope.hasOpenSessions = $scope.openSessions && $scope.openSessions.length !== 0;
          } else {
            $scope.hasOpenSessions = false;
          }
        });
    }

    function acceptRequest(sessionID) {
      sessionService.acceptRequest(sessionID)
        .then(function() {
          getRequests();
          getAppointments();
        });
    }

    function cancelAppointment(sessionID) {
      sessionService.cancelAppointment(sessionID)
        .then(function() {
          getAppointments();
        });
    }

    function closeSession(sessionID) {
      console.log('Closing session ' + sessionID);
      sessionService.closeSession(sessionID)
        .then(function() {
          getOpenSessions();
        });
    }

    function appealSession(sessionID) {
      console.log('Appealing session ' + sessionID);
      sessionService.appealSession(sessionID, 'THIS IS A SESSION APPEAL')
        .then(function() {
          getOpenSessions();
        });
    }



  }

})(angular);
