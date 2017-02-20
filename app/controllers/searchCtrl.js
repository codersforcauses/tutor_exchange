(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SearchCtrl', SearchCtrl);


  SearchCtrl.$inject = ['$scope', '$http', 'searchService', 'fetchService'];
  function SearchCtrl($scope, $http, searchService, fetchService) {
    $scope.results = [];
    $scope.query = {};
    loadAPIData();

    function loadAPIData() {
      fetchService
        .fetchUnits()
        .then(function(response) {
          if (response.data) {
            $scope.availableUnits = response.data;
          }
        });

      fetchService
        .fetchLanguages()
        .then(function(response) {
          if (response.data) {
            $scope.tutorLanguages = response.data;
          }
        });
    }

    function resetSearch() {
      $scope.results = [];
      delete $scope.errorMsg;
    }

    $scope.submit = function(query) {
      resetSearch();
      searchService
        .getTutors(query)
        .then(function(response) {
          if (response.data) {
            if (response.data.length > 0) {
              $scope.results = response.data;
            } else {
              $scope.errorMsg = 'No Tutors matching your description can be found';
            }
          } else {
            $scope.errorMsg = 'Unable to perform Search Query';
          }
        });
    };

  }

})(angular);
