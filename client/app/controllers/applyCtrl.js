(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('ApplyCtrl', ApplyCtrl);


  ApplyCtrl.$inject = ['$scope', 'authService', '$state', 'userFunctions','UWA_UNITS', 'USER_ROLES', 'TUTOR_LANGUAGES'];
  function ApplyCtrl($scope, authService, $state, userFunctions, UWA_UNITS, USER_ROLES, TUTOR_LANGUAGES) {
    if (authService.isAuthenticated()) {
      $state.go('dashboard');// Already Logged in
    }

    loadAPIData();

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
        user.languages = [{languageCode: 'en', languageName: 'English'}];
      }

      authService
        .register(user)
        .then(function(result) {
          if (authService.isAuthenticated()) {
            $state.go('dashboard');
          } else {
            $scope.errorMsg = result.data.message;
            $scope.applyForm.$setPristine();
          }
        });
    };
  }

})(angular);
