(function(angular) {

  'use strict';

  angular
    .module('tutorExchange', [
      'ui.bootstrap',
      'ngAnimate',
      'ui.router',
    ])
    .config(config);


  config.$inject = ['$urlRouterProvider', '$stateProvider'];
  function config($urlRouterProvider, $stateProvider) {
    $urlRouterProvider
      .otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/templates/home.html',
      })

      .state('login', {
        url: '/login',
        templateUrl: 'app/templates/login.html',
        controller: 'LoginCtrl',
      })

      .state('login_success', {
        url: '/login_success',
        templateUrl: 'app/templates/login_success.html',
        controller: 'LoginSuccessCtrl',
      })

      .state('apply', {
        url: '/apply',
        templateUrl: 'app/templates/apply.html',
        controller: 'ApplyCtrl',
      });
  }

})(angular);
