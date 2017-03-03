(function(angular) {

  'use strict';

  angular
    .module('tutorExchange')
    .constant('USER_ROLES', {
      pendingUser: 'pendingUser',
      student: 'student',
      pendingTutor: 'pendingTutor',
      tutor: 'tutor',
      admin: 'admin',
    });

})(angular);
