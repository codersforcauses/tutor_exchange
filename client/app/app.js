angular
    .module('tutorExchange', [
        'ui.bootstrap',
        'ngAnimate',
        'ui.router'
    ])
    .config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/templates/home.html',
            })

            .state('login', {
                url: '/login',
                templateUrl: 'app/templates/login.html',
            })

            .state('apply', {
                url: '/apply',
                templateUrl: 'app/templates/apply.html',
            });
    }]);