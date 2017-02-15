(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SearchCtrl', SearchCtrl);


  SearchCtrl.$inject = ['$scope', 'searchService'];
  function SearchCtrl($scope, searchService) {
    $scope.results = [];

    $scope.submit = function(query) {
      searchService
        .getTutors()
        .then(function(response) {
          if (response.data) {
            $scope.results = response.data;
            console.log(response.data);
          } else {
            console.log('error - todo: more descriptive error message here');
          }
        });
    };

  }

})(angular);
