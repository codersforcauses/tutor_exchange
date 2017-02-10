(function(angular) {
'use strict';

angular
  .module('tutorExchange')
  .controller('ProfileCtrl', ProfileCtrl);


ProfileCtrl.$inject = ['$scope', 'session', 'authService', 'userFunctions', '$state', '$http', 'UWA_UNITS', 'TUTOR_LANGUAGES'];
function ProfileCtrl($scope, session, authService, userFunctions, $state, $http, UWA_UNITS, TUTOR_LANGUAGES) {
  $scope.availableUnits = UWA_UNITS;
  $scope.tutorLanguages = TUTOR_LANGUAGES;
  $scope.editMode = false;

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

  $scope.upgrade = function() {
    if ($scope.user) {
      $scope.edituser = angular.copy($scope.user);
      $scope.upgradeAccount = true;
      $scope.editMode = true;
    }
  };

  $scope.upgradeSubmit = function() {
    /* Will need to Submit a new Application to the Guild*/
    $scope.edituser.accountType = 'tutor';
    $scope.edituser.visible = true;
    $scope.save();
    $scope.upgradeAccount = false;
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
      $scope.user = angular.copy($scope.edituser); /*Direct copy for now, in future may compare values*/
      userFunctions.updateDetails($scope.user)
      .then(function(response) {
        if (response.data.success) {
          $scope.editMode = false;
          console.log(response);
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
