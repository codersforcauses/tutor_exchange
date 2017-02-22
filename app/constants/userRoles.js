(function(angular) {

  'use strict';

  angular
    .module('tutorExchange')
    .constant('USER_ROLES', {
      student: 'student',
      pendingTutor: 'pendingTutor',
      tutor: 'tutor',
      admin: 'admin',
    });

})(angular);
