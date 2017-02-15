(function(angular) {
'use strict';

angular
  .module('tutorExchange')
  .controller('ProfileCtrl', ProfileCtrl);


ProfileCtrl.$inject = ['$scope', '$state', '$http', 'userFunctions', 'fetchService'];
function ProfileCtrl($scope, $state, $http, userFunctions, fetchService) {

  loadAPIData();
  loadUserData();
  $scope.editMode = false;
  $scope.accountType = userFunctions.getSessionDetails().role;

  function loadAPIData() {
    fetchService
      .fetchUnits()
      .then(function(response) {
        if (response.data) {
          $scope.availableUnits = response.data;
        }
      });

    fetchService
      .fetchLanguages()
      .then(function(response) {
        if (response.data) {
          $scope.availableUnits = response.data;
        }
      });
  }

  function loadUserData() {
    userFunctions
    .getProfile()
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
      userFunctions.updateProfile($scope.edituser)
      .then(function(response) {
        if (response.data && response.data.success) {
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
