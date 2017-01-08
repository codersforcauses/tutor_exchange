angular
  .module('tutorExchange')
  .controller('ApplyCtrl', ['$scope', '$http', '$state', 'myData',
    function($scope, $http, $state, myData) {

      $scope.submit = function() {
        if (!$scope.user) {
          return;
        }

        $http.get('/users?id=' + $scope.user.id)
          .then(function(response) {
            if (response.data.length > 0) {
              console.log('User already exists');
              return;
            }
          });

        $scope.user.name = $scope.user.firstName + ' ' + $scope.user.lastName;

        var data = angular.toJson($scope.user);

        console.log(data);

        $http.post('/users', data)
          .then(function() {
            console.log('New user!!!');
            myData.set($scope.user);
            $state.go('login_success');
          });

      };

    },
  ])
  .directive('passwordMatch', [function() {
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
      }
  },
  ]);

