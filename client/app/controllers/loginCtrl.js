angular
  .module('tutorExchange')
  .controller('LoginCtrl', ['$scope', '$http', '$state', 'myData',
    function($scope, $http, $state, myData) {

      $scope.submit = function() {

        if (!$scope.user) {
          return;
        }

        $http.get('/users?id=' + $scope.user.id)
          .then(function(response) {

            if (response.data.length === 0) {
              console.log('User does not exist');
              return;
            }

            if ($scope.user.password !== response.data[0].password) {
              console.log('Wrong password');
              return;
            }

            $scope.user.name = response.data[0].name;
            console.log('Logged in as ' + $scope.user.name);
            myData.set($scope.user);
            $state.go('login_success');

          });
      };



    },
  ]);