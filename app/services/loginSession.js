(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .factory('loginSession', loginSession);


  loginSession.$inject = [];
  function loginSession() {

    var userData = {
      id:     null,
      name:   null,
      role:   null,
    };

    var service = {
      create:       create,
      destroy:      destroy,
      getUserId:    getUserId,
      getUserName:  getUserName,
      getUserRole:  getUserRole,
      upgradeToTutor: upgradeToTutor,
      exists:   exists,
    };

    return service;

    function create(userId, userName, userRole) {
      userData.id = userId;
      userData.name = userName;
      userData.role = userRole;
    }

    function destroy() {
      userData.id = null;
      userData.name = null;
      userData.role = null;
    }

    function getUserId() {
      return userData.id;
    }

    function getUserName() {
      return userData.name;
    }

    function getUserRole() {
      return userData.role;
    }

    function upgradeToTutor() {
      if (exists() && userData.role === 'student') {
        userData.role = 'pendingTutor';
      }
    }

    function exists() {
      return !!userData.id;
    }

  }

})(angular);