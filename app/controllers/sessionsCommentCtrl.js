(function(angular) {
  'use strict';

  angular
    .module('tutorExchange')
    .controller('SessionsCommentCtrl', SessionsCommentCtrl);


  SessionsCommentCtrl.$inject = ['$scope', '$uibModalInstance', 'comment'];
  function SessionsCommentCtrl($scope, $uibModalInstance, comment) {
    $scope.comment = comment;

    $scope.cancel = function() {
      $uibModalInstance.dismiss('close');
    };
  }
})(angular);
