(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SearchCtrl', SearchCtrl);


  SearchCtrl.$inject = ['$scope', 'session', 'authService'];
  function SearchCtrl($scope, session, authService, $state) {

  }

})(angular);
