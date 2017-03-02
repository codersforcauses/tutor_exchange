(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .directive('getName', ['whoService', function(whoService) {
      return {
        restrict: 'A',

        scope: {
          userID: '=getName',
        },

        link: function(scope, element, attrs) {
          var regex = /^[0-9]{8}$/;

          scope.$watch('userID', function(newValue, oldValue) {
            if (regex.test(scope.userID)) {
              printName(scope.userID);
            } else {
              element.text('');
            }
          });

          function printName(userID) {
            whoService.getName(userID)
              .then(function(result) {
                if (!result.data || result.data.userDoesNotExist) {
                  element.text('User does not exist');
                } else {
                  element.text(result.data.firstName + ' ' + result.data.lastName);
                }
              });
          }

        },
      };

    },]);

})(angular);
