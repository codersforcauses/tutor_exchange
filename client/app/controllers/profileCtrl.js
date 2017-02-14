(function(angular) {
'use strict';

angular
  .module('tutorExchange')
  .controller('ProfileCtrl', ProfileCtrl);


ProfileCtrl.$inject = ['$scope', 'session', 'authService', 'userFunctions', '$state', '$http', 'UWA_UNITS', 'TUTOR_LANGUAGES'];
function ProfileCtrl($scope, session, authService, userFunctions, $state, $http, UWA_UNITS, TUTOR_LANGUAGES) {

  loadAPIData();
  loadUserData();
  $scope.editMode = false;
  $scope.accountType = session.getUserRole();

  function loadAPIData() {
    userFunctions
    .fetchAPIData('/api/data/units')
    .then(function(response) {
          if (response.data) {
            $scope.availableUnits = response.data;
          }
        }
    );
    userFunctions
    .fetchAPIData('/api/data/languages')
    .then(function(response) {
          if (response.data) {
            $scope.tutorLanguages = response.data;
          }
        }
    );
  }

  function loadUserData() {
    userFunctions
    .getDetails(session.getUserId())
    .then(function(response) {
        if (response.data) {
          $scope.user = response.data;
          console.log(response.data);
        } else {
          console.log('Unable to Load User Data');
        }
      }
    );
  }

  $scope.upgrade = function() {
    if ($scope.user) {
      $scope.edituser = angular.copy($scope.user);
      $scope.upgradeAccount = true;
      $scope.editMode = true;
    }
  };

  $scope.upgradeSubmit = function() {
    if ($scope.user) {
      /* Will need to Submit a new Application to the Guild*/
      $scope.edituser.visible = true;
      $scope.save();
      $scope.accountType = 'pendingTutor';
      $scope.upgradeAccount = false;
    }
  };

  $scope.edit = function() {
    if ($scope.user) {
      $scope.edituser = angular.copy($scope.user);
      $scope.editMode = true;
    }
  };

  $scope.cancel = function() {
    if ($scope.edituser) delete $scope.edituser;
    $scope.editMode = false;
    $scope.upgradeAccount = false;
  };

  $scope.save = function() {
    if ($scope.user && $scope.edituser) {
      console.log($scope.edituser);
      userFunctions.updateDetails($scope.edituser)
      .then(function(response) {
        if (response.data.success) {
          loadUserData();
          $scope.editMode = false;
        } else {
          console.log('Unable to Update User Data');
        }
      });
    }
  };

  $scope.toggleVisiblity = function() {
    if ($scope.user && $scope.edituser) {
      $scope.edituser.visible = !$scope.edituser.visible;
    }
  };

}
})(angular);
