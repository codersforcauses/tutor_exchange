(function(angular) {

  'use strict';

  angular
    .module('tutorExchange')
    .constant('USER_ROLES', {
      all:      '*',
      student:  'student',
      tutor:    'tutor',
      guild:    'guild',
    });

})(angular);
