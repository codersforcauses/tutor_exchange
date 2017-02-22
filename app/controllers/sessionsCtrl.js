(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsCtrl', SessionsCtrl);


  SessionsCtrl.$inject = ['$scope', 'userFunctions', 'sessionService', '$uibModal'];
  function SessionsCtrl($scope, userFunctions, sessionService, $uibModal) {

    $scope.role = userFunctions.getSessionDetails().role;

    $scope.acceptRequest = acceptRequest;
    $scope.cancelAppointment = cancelAppointment;
    $scope.rescheduleAppointment = cancelAppointment;
    $scope.closeSession = closeSession;
    $scope.appealSession = appealSession;

    $scope.openRequestModal = openRequestModal;
    $scope.openRescheduleModal = openRescheduleModal;
    $scope.openCancelModal = openCancelModal;
    $scope.openAppealModal = openAppealModal;


    (function refresh() {
      getRequests();
      getAppointments();
      getOpenSessions();
    })();




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
      sessionService.closeSession(sessionID)
        .then(function() {
          getOpenSessions();
        });
    }

    function appealSession(sessionID, message) {
      sessionService.appealSession(sessionID, message)
        .then(function() {
          getOpenSessions();
        });
    }

    function openRequestModal() {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/sessions_request.html',
      });
    }

    function openRescheduleModal() {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/sessions_reschedule.html',
      });
    }

    function openCancelModal(appointment) {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/sessions_cancel.html',
        controller: 'SessionsCancelCtrl',
        resolve: {
          appointment: function() {
            return appointment;
          },
        },
      });

      modalInstance.result.then(
        function() {
          cancelAppointment(appointment.sessionID);
        },
        function() {}
      );
    }

    function openAppealModal(sessionID) {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/sessions_appeal.html',
        controller: 'SessionsAppealCtrl',
      });

      modalInstance.result.then(
        function(message) {
          console.log(message);
          appealSession(sessionID, message);
        },
        function() {}
      );
    }

  }

})(angular);
