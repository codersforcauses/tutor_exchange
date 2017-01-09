angular
  .module('tutorExchange')
  .controller('ApplyCtrl', ['$scope', '$http', '$state', 'myData', 'UWA_UNITS',
    function($scope, $http, $state, myData, UWA_UNITS) {
      $scope.availableUnits = UWA_UNITS;

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
  ]);

