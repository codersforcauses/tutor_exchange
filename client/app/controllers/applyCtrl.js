(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('ApplyCtrl', ApplyCtrl);


  ApplyCtrl.$inject = ['$scope', '$state', 'userFunctions', 'USER_ROLES', 'fetchService'];
  function ApplyCtrl($scope, $state, userFunctions, USER_ROLES, fetchService) {
    if (userFunctions.isLoggedIn()) {
      $state.go('dashboard');// Already Logged in
    }

    loadAPIData();

    function loadAPIData() {
      fetchService
      .fetchUnits()
      .then(function(response) {
            if (response.data) {
              $scope.availableUnits = response.data;
            }
          }
      );
      fetchService
      .fetchLanguages()
      .then(function(response) {
            if (response.data) {
              $scope.tutorLanguages = response.data;
            }
          }
      );
    }

    $scope.submit = function(user) {
      user.id = parseInt(user.id);
      user.name = user.firstName + ' ' + user.lastName;

      if (user.tutor) {
        user.accountType = USER_ROLES.tutor;
        user.verified = false;
        user.visible = true;
      } else {
        user.accountType = USER_ROLES.student;
      }

      /*Check Date of Birth is Valid using MomentJS*/
      var inputDOB = user.yearDOB + '-' + user.monthDOB + '-' + user.dayDOB;
      if (moment(inputDOB, ['YYYY-MM-DD'], true).isValid()) {
        //user.DOB = new Date(inputDOB);
        user.DOB = inputDOB;
      } else {
        $scope.errorMsg = 'Date of Birth is Invalid';
        return;
      }

      delete user.firstName;
      delete user.lastName;
      delete user.dayDOB;
      delete user.monthDOB;
      delete user.yearDOB;

      user.sex = user.sex.charAt(0);

      console.log(user);

      // Set English for Default
      if (!user.languages) {
        user.languages = ['en'];
      }

      userFunctions
        .apply(user)
        .then(function(response) {
          if (userFunctions.isLoggedIn()) {
            $state.go('dashboard');
          } else {
            $scope.errorMsg = response.data.message;
            $scope.applyForm.$setPristine();
          }
        });
    };
  }

})(angular);
