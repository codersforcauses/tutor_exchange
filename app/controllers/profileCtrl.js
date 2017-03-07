(function(angular) {
'use strict';

angular
  .module('tutorExchange')
  .controller('ProfileCtrl', ProfileCtrl);


ProfileCtrl.$inject = ['$scope', '$state', '$http', 'userFunctions', 'fetchService', '$uibModal'];
function ProfileCtrl($scope, $state, $http, userFunctions, fetchService, $uibModal) {

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
          $scope.tutorLanguages = response.data;
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
      console.log($scope.edituser);
      userFunctions.upgradeAccount($scope.edituser)
      .then(function(response) {
        if (response.data && response.data.success) {
          loadUserData();
          $scope.accountType = 'pendingTutor';
          $scope.upgradeAccount = false;
          $scope.editMode = false;
        } else {
          console.log('Unable to Upgrade Account');
        }
      });
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

  $scope.openChangePassword = function() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/changePassword.html',
      controller: 'ChangePasswordCtrl',
      backdrop: 'static',
      keyboard: false,
    });
  };

}
})(angular);
