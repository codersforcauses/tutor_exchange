(function(angular) {
  'use strict';

  angular
    .module('tutorExchange', [
      'ui.bootstrap',
      'ngAnimate',
      'ui.router',
      'ui.select',
      'ngMessages',
      'ngSanitize',
      'moment-picker',
      'angular-loading-bar',
    ])
    .config(config)
    .run(run);


  config.$inject = ['$urlRouterProvider', '$stateProvider', 'USER_ROLES'];
  function config($urlRouterProvider, $stateProvider, USER_ROLES) {
    $urlRouterProvider
      .otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'templates/home.html',
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl',
      })

      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl',
        data: {
          authRequired: true,
          authRoles: [USER_ROLES.pendingUser, USER_ROLES.student, USER_ROLES.pendingTutor, USER_ROLES.tutor],
        },
      })

      .state('profile', {
        url: '/profile',
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl',
        data: {
          authRequired: true,
          authRoles: [USER_ROLES.student, USER_ROLES.pendingTutor, USER_ROLES.tutor],
        },
      })

      .state('search', {
        url: '/search',
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl',
        data: {
          authRequired: true,
          authRoles: [USER_ROLES.student, USER_ROLES.pendingTutor, USER_ROLES.tutor],
        },
      })

      .state('sessions', {
        url: '/sessions',
        templateUrl: 'templates/sessions.html',
        controller: 'SessionsCtrl',
        data: {
          authRequired: true,
          authRoles: [USER_ROLES.student, USER_ROLES.pendingTutor, USER_ROLES.tutor],
        },
      })
      .state('apply', {
        url: '/apply',
        templateUrl: 'templates/apply.html',
        controller: 'ApplyCtrl',
      })

      .state('termsOfUse', {
        url: '/termsOfUse',
        templateUrl: 'templates/termsOfUse.html',
      })

      .state('resetPassword', {
        url: '/resetPassword?id&token',
        templateUrl: 'templates/resetPassword.html',
        controller: 'ResetPasswordCtrl',
      })

      .state('about', {
        url: '/about',
        templateUrl: 'templates/about.html',
      })

      .state('help', {
        url: '/help',
        templateUrl: 'templates/help.html',
        data: {
          authRequired: true,
          authRoles: [USER_ROLES.pendingUser, USER_ROLES.student, USER_ROLES.pendingTutor, USER_ROLES.tutor],
        },
      });
  }

  run.$inject = ['$rootScope', 'authService', '$state'];
  function run($rootScope, authService, $state) {
    authService.retrieveToken();

    $rootScope.$on('$stateChangeStart', function(event, next) {
      if (next.data && next.data.authRequired) {
        if (!authService.isAuthenticated()) {
          event.preventDefault();
          $state.go('login');
        } else if (next.data.authRoles && !authService.isAuthorised(next.data.authRoles)) {
          event.preventDefault();
        }
      }
    });
  }

  angular
    .module('tutorExchange')
      .config(['momentPickerProvider', function(momentPickerProvider) {
        momentPickerProvider.options({
          //showHeader: false,
          minutesFormat: 'HH:mm',
        });
      },
    ]);

  angular.module('angular-loading-bar')
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  },]);



})(angular);
