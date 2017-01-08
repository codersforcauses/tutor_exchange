(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('passwordMatch', passwordMatch);


  passwordMatch.$inject = [];
  function passwordMatch() {

    return {
      require: 'ngModel',
      scope: {
        inputPassword: '=passwordMatch',
      },
      link: function(scope, element, attributes, ngModel) {
        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.inputPassword;
        };
        scope.$watch('inputPassword', function() {
          ngModel.$validate();
        });
      },
    };
  }

})(angular);
