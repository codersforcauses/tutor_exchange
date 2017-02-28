(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsCtrl', SessionsCtrl);


  SessionsCtrl.$inject = ['$scope', 'userFunctions', 'USER_ROLES', 'sessionService', '$uibModal'];
  function SessionsCtrl($scope, userFunctions, USER_ROLES, sessionService, $uibModal) {

    $scope.isTutor = (userFunctions.getSessionDetails().role === USER_ROLES.tutor || userFunctions.getSessionDetails().role === USER_ROLES.pendingTutor);

    $scope.createRequest = createRequest;
    $scope.acceptRequest = acceptRequest;
    $scope.rejectRequest = rejectRequest;
    $scope.cancelAppointment = cancelAppointment;
    $scope.rescheduleAppointment = cancelAppointment;
    $scope.closeSession = closeSession;
    $scope.appealSession = appealSession;

    $scope.openRejectModal = openRejectModal;
    $scope.openRequestModal = openRequestModal;
    $scope.openAppealModal = openAppealModal;

    refresh();




    function refresh() {
      getRequests();
      getAppointments();
      getOpenSessions();
    }

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

    function createRequest(session) {
      sessionService.createRequest(session)
        .then(function() {
          getRequests();
        });
    }

    function acceptRequest(sessionID) {
      sessionService.acceptRequest(sessionID)
        .then(function() {
          getRequests();
          getAppointments();
        });
    }

    function rejectRequest(sessionID) {
      sessionService.rejectRequest(sessionID)
        .then(function() {
          getRequests();
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



    function openRequestModal(session) {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/sessions_request.html',
        controller: 'SessionsRequestCtrl',
        resolve: {
          session: function() {
            return session;
          },
        },
      });

      modalInstance.result.then(
        function(newSession) {
          console.log(newSession);

          if (!session) {
            //Original session not provided: new request
            createRequest(newSession);

          } else {
            //There was an orginal session: cancel it.
            sessionService.rejectRequest(session.sessionID)
              .then(function() {
                sessionService.createRequest(newSession)
                .then(function(response) {
                  refresh();
                  console.log(response);
                });
              });
          }
        },
        function() {}
      );
    }

    function openRejectModal(session, sessionType) {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/sessions_reject.html',
        controller: 'SessionsRejectCtrl',
        resolve: {
          session: function() {
            return session;
          },
          sessionType: function() {
            return sessionType;
          },
        },
      });

      modalInstance.result.then(
        function() {
          if (sessionType === 'request') rejectRequest(session.sessionID);
          if (sessionType === 'appointment') cancelAppointment(session.sessionID);
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
