angular
  .module('tutorExchange')
  .controller('LoginSuccessCtrl', ['$scope', 'myData',
    function($scope, myData) {
      $scope.user = myData.get();

      $scope.logout = function() {
        $scope.user = {};
        myData.set({});
      };

    },
  ]);