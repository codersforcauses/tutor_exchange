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
      if (response.data.length == 1) {
        $scope.user = response.data[0];
        console.log(response);
      } else {
        console.log('Unable to Load User Data');
      }
    }
  );

  $scope.edit = function() {
    if ($scope.user) {
      $scope.edituser = angular.copy($scope.user);
      $scope.editMode = true;
    }
  };

  $scope.cancel = function() {
    if ($scope.edituser) delete $scope.edituser;
    $scope.editMode = false;
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
    if ($scope.edituser && $scope.user) {
      var currentVisiblity = !$scope.edituser.visible;
      $scope.edituser.visible = currentVisiblity;
      $scope.user.visible = currentVisiblity;
    }
  };

}
})(angular);
